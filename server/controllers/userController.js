import pkg from "pg";
import bcrypt from "bcrypt";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const updateProfile = async (req, res) => {
  const { name, avatar_url } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "UPDATE users SET name = $1, avatar_url = $2 WHERE id = $3 RETURNING id, name, email, avatar_url, email_notifications, daily_reminder",
      [name, avatar_url, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const updateNotifications = async (req, res) => {
  const { email_notifications, daily_reminder, reminder_time } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "UPDATE users SET email_notifications = $1, daily_reminder = $2, reminder_time = $3 WHERE id = $4 RETURNING id, name, email, avatar_url, email_notifications, daily_reminder, reminder_time",
      [email_notifications, daily_reminder, reminder_time || '08:00', userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update notifications error:", error);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: "New password must be at least 3 characters" });
  }

  try {
    // Get current user password
    const userRes = await pool.query("SELECT password FROM users WHERE id = $1", [userId]);
    const user = userRes.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash and update
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedNewPassword, userId]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const getUserSettings = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT id, name, email, avatar_url, email_notifications, daily_reminder, reminder_time FROM users WHERE id = $1",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get user settings error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};
