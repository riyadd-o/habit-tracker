import cron from "node-cron";
import pkg from "pg";
import dotenv from "dotenv";
import { sendDailyReminder, sendStreakWarning } from "./emailService.js";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const TIMEZONE = "Africa/Addis_Ababa";

// ✅ Normalize time
const normalizeTime = (time) => {
  if (!time) return "08:00";

  if (time.includes("AM") || time.includes("PM")) {
    let [t, mod] = time.split(" ");
    let [h, m] = t.split(":");

    h = parseInt(h);

    if (mod === "PM" && h !== 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;

    return `${String(h).padStart(2, "0")}:${m}`;
  }

  return time.slice(0, 5);
};

// ✅ Current time HH:mm
const getCurrentTime = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
};

// ✅ Today YYYY-MM-DD
const getToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
};

export const notifyDueUsers = async () => {
  const currentTime = getCurrentTime();
  const today = getToday();

  console.log(`\n⏰ CRON → ${currentTime} (${today})`);

  try {
    const usersRes = await pool.query(`
      SELECT id, name, email, reminder_time
      FROM users
      WHERE daily_reminder = true
    `);

    for (const user of usersRes.rows) {
      try {
        const reminderTime = normalizeTime(user.reminder_time);

        // ⛔ Only exact minute
        if (currentTime !== reminderTime) {
          continue;
        }

        console.log(`👤 ${user.email}`);

        // 📊 Get incomplete habits
        const habitsRes = await pool.query(
          `SELECT h.id, h.title, h.streak, h.last_completed_date
           FROM habits h
           WHERE h.user_id = $1
           AND NOT EXISTS (
             SELECT 1 FROM habit_logs hl
             WHERE hl.habit_id = h.id AND hl.date = $2
           )`,
          [user.id, today]
        );

        const incompleteHabits = habitsRes.rows;

        if (incompleteHabits.length === 0) {
          console.log(`✅ No incomplete habits`);
          continue;
        }

        // ⚠️ Detect at-risk
        const atRiskHabits = incompleteHabits.filter((h) => {
          if (!h.last_completed_date) return false;

          const diffDays = Math.floor(
            (new Date(today) - new Date(h.last_completed_date)) /
            (1000 * 60 * 60 * 24)
          );

          return diffDays >= 2 && diffDays <= 4;
        });

        // =========================
        // ✅ DAILY REMINDER LOCK (FIXED)
        // =========================
        const dailyLock = await pool.query(
          `UPDATE users
           SET last_notification_sent = NOW(),
               last_reminder_time_sent = $1
           WHERE id = $2
           AND (
             last_notification_sent IS NULL
             OR DATE(last_notification_sent AT TIME ZONE 'Africa/Addis_Ababa') != $3
             OR last_reminder_time_sent != $1
           )
           RETURNING id`,
          [reminderTime, user.id, today]
        );

        if (dailyLock.rowCount > 0) {
          console.log(`📧 DAILY SENT → ${user.email}`);
          await sendDailyReminder(user.email, user.name, incompleteHabits);
        } else {
          console.log(`🛑 DAILY BLOCKED → ${user.email}`);
        }

        // =========================
        // ✅ STREAK WARNING LOCK (ALREADY CORRECT)
        // =========================
        if (atRiskHabits.length > 0) {
          const warningLock = await pool.query(
            `UPDATE users
             SET last_streak_warning = NOW()
             WHERE id = $1
             AND (
               last_streak_warning IS NULL
               OR DATE(last_streak_warning AT TIME ZONE 'Africa/Addis_Ababa') != $2
             )
             RETURNING id`,
            [user.id, today]
          );

          if (warningLock.rowCount > 0) {
            console.log(`🚨 WARNING SENT → ${user.email}`);
            await sendStreakWarning(user.email, user.name, atRiskHabits);
          } else {
            console.log(`🛑 WARNING BLOCKED`);
          }
        }

      } catch (err) {
        console.error(`❌ User ${user.email} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Cron error:", err.message);
  }
};

export const startCronJobs = () => {
  cron.schedule("* * * * *", () => {
    notifyDueUsers();
  }, {
    timezone: TIMEZONE
  });

  console.log("✅ Cron started (NO duplicates, production safe)");
};