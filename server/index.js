import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { authenticateToken } from "./middleware/auth.js";
import { startCronJobs } from "./services/cronService.js";

dotenv.config();

const { Pool } = pkg;

// Create app ✅
const app = express();

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({ origin: "*" }));
app.use(express.json());

// Serve static files from uploads folder
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Database connection logic with auto-recovery ✅
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false // Required for some Neon environments
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Handle unexpected errors on idle clients to prevent process crash
pool.on('error', (err, client) => {
  console.error('⚠️ Unexpected error on idle DB client:', err.message);
  // We don't exit the process here, pool will handle new connections
});



// Test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Start server ✅
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server is production-ready and running on port ${PORT}`);
});



// Initial connection attempt with retry
const connectWithRetry = async () => {
  try {
    await pool.connect();
    console.log("✨ Connected to Neon DB successfully!");
    
    // Ensure user settings columns exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS daily_reminder BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS reminder_time VARCHAR(5) DEFAULT '08:00',
      ADD COLUMN IF NOT EXISTS last_notification_sent DATE
    `);

    // Ensure habit streak columns exist
    await pool.query(`
      ALTER TABLE habits
      ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_completed_date DATE
    `);
    console.log("🛠️ Database schema checked/updated.");
    
    // Start background cron jobs after DB connects
    startCronJobs();
  } catch (err) {
    console.error("❌ DB connection failed. Retrying in 5 seconds...", err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Pool has ended');
    process.exit(0);
  });
});


// Get habits with completion status for today
app.get("/habits", authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User identity unverified" });
    }

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    
    const result = await pool.query(
      `SELECT h.*, 
       EXISTS (SELECT 1 FROM habit_logs WHERE habit_id = h.id AND date = $2) as completed_today
       FROM habits h 
       WHERE h.user_id = $1 
       ORDER BY h.id DESC`, 
      [req.user.id, today]
    );

    const habits = result.rows.map(h => {
      let displayStreak = h.streak;
      let diffDays = 0;
      
      if (h.last_completed_date) {
        const todayVal = new Date();
        todayVal.setHours(0, 0, 0, 0);
        
        const lastVal = new Date(h.last_completed_date);
        lastVal.setHours(0, 0, 0, 0);
        
        diffDays = Math.round((todayVal - lastVal) / 86400000);
        
        // If missed more than 3 days (i.e. diffDays > 4, day 1,2,3,4 allowed)
        if (diffDays > 4 && !h.completed_today) {
          displayStreak = 0;
        }
      }
      
      return {
        ...h,
        streak: displayStreak,
        completed: h.completed_today,
        diffDays // Useful for frontend to identify "at risk"
      };
    });

    res.json(habits);
  } catch (error) {
    console.error("GET /habits database error:", error.message);
    res.status(500).json({ error: "Internal server error fetching habits" });
  }
});

// Get all logs for current user (for streak calculation)
app.get("/logs", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT hl.* FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id WHERE h.user_id = $1 ORDER BY hl.date DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET /logs error:", error);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});

app.post("/habits", authenticateToken, async (req, res) => {
  const { title, description, frequency } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO habits (title, description, frequency, user_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description || "", frequency || "daily", req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding habit:", error);
    res.status(500).json({ error: "Failed to add habit" });
  }
});

// Delete habit (protected)
app.delete("/habits/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM habits WHERE id = $1 AND user_id = $2", 
      [id, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Habit not found or unauthorized" });
    }
    
    res.json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error("Error deleting habit:", error);
    res.status(500).json({ error: "Failed to delete habit" });
  }
});

app.put("/habits/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, frequency } = req.body;
  try {
    const result = await pool.query(
      "UPDATE habits SET title = $1, description = $2, frequency = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
      [title, description, frequency, id, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Habit not found or unauthorized" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating habit:", error);
    res.status(500).json({ error: "Failed to update habit" });
  }
});

app.put("/habits/:id/toggle", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  try {
    // 1. Get habit and verify ownership
    const habitRes = await pool.query(
      "SELECT id, streak, last_completed_date FROM habits WHERE id = $1 AND user_id = $2", 
      [id, req.user.id]
    );
    
    if (habitRes.rowCount === 0) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const habit = habitRes.rows[0];
    const logRes = await pool.query(
      "SELECT id FROM habit_logs WHERE habit_id = $1 AND date = $2", 
      [id, today]
    );

    let newStreak = habit.streak;
    let newLastCompleted = habit.last_completed_date;

    if (logRes.rowCount > 0) {
      // Uncheck habit - We don't decrement streak here as per modern habit app standards, 
      // but we do remove the log. If user unchecks today, last_completed_date remains today?
      // Actually, if they uncheck, they lose today's progress.
      await pool.query("DELETE FROM habit_logs WHERE id = $1", [logRes.rows[0].id]);
      
      // Better: If they uncheck today, reset last_completed_date to previous log date if exists
      const prevLogRes = await pool.query(
        "SELECT date FROM habit_logs WHERE habit_id = $1 AND date < $2 ORDER BY date DESC LIMIT 1",
        [id, today]
      );
      
      newLastCompleted = prevLogRes.rowCount > 0 ? prevLogRes.rows[0].date : null;
      // Also potentially decrement streak if we want to be strict, 
      // but the prompt says "streak should decrease correctly day-by-day" (wait, it says "Streak should NOT reset to 0 unless user misses a full day")
      // Let's just keep streak logic simple: increment on completion, decrement on un-completion.
      newStreak = Math.max(0, habit.streak - 1);
    } else {
      // Check habit (Complete Today)
      await pool.query("INSERT INTO habit_logs (habit_id, date) VALUES ($1, $2)", [id, today]);
      
      if (!habit.last_completed_date) {
        newStreak = 1;
      } else {
        const todayVal = new Date();
        todayVal.setHours(0, 0, 0, 0);
        
        const lastVal = new Date(habit.last_completed_date);
        lastVal.setHours(0, 0, 0, 0);
        
        const diffDays = Math.round((todayVal - lastVal) / 86400000);

        if (diffDays === 0) {
          // Already completed once today (prevent double increment)
          newStreak = habit.streak;
        } else if (diffDays >= 1 && diffDays <= 4) {
          // Normal completion (diff 1) or restore window (diff 2, 3, 4)
          newStreak = habit.streak + 1;
        } else {
          // Expired if missed 4+ days
          newStreak = 1;
        }
      }
      newLastCompleted = today;
    }

    // 2. Update habit with new streak data
    const finalLongest = Math.max(habit.longest_streak || 0, newStreak);
    await pool.query(
      "UPDATE habits SET streak = $1, longest_streak = $2, last_completed_date = $3 WHERE id = $4",
      [newStreak, finalLongest, newLastCompleted, id]
    );

    // 3. Return updated habit state
    const result = await pool.query(
      `SELECT h.*, 
       EXISTS (SELECT 1 FROM habit_logs WHERE habit_id = h.id AND date = $2) as completed
       FROM habits h 
       WHERE h.id = $1`, 
      [id, today]
    );
    
    // Add diffDays for frontend
    const updatedHabit = result.rows[0];
    if (updatedHabit.last_completed_date) {
      const todayVal = new Date();
      todayVal.setHours(0, 0, 0, 0);
        
      const lastVal = new Date(updatedHabit.last_completed_date);
      lastVal.setHours(0, 0, 0, 0);
      
      updatedHabit.diffDays = Math.round((todayVal - lastVal) / 86400000);
    }

    res.json(updatedHabit);
  } catch (error) {
    console.error("Error toggling habit:", error);
    res.status(500).json({ error: "Failed to toggle completion" });
  }
});

// Avatar Upload Endpoint
app.put("/user/avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    const result = await pool.query(
      "UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, avatar_url",
      [fileUrl, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error uploading avatar:", error.message);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});


