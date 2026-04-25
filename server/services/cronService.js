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

// ✅ Normalize ANY time format → "HH:MM"
const normalizeTime = (time) => {
  if (!time) return "08:00";
  if (typeof time === "string" && (time.includes("AM") || time.includes("PM"))) {
    const [t, mod] = time.split(" ");
    let [h, m] = t.split(":");
    if (mod === "PM" && h !== "12") h = String(+h + 12);
    if (mod === "AM" && h === "12") h = "00";
    return `${h.padStart(2, "0")}:${m}`;
  }
  if (typeof time === "string" && time.length > 5) return time.slice(0, 5);
  return time;
};

const getCurrentTime = () => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
};

const getToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
};

// 🧠 MAIN ENGINE
export const notifyDueUsers = async () => {
  console.log("🚀 Running filtered reminder engine...");

  const currentTime = getCurrentTime();
  const today = getToday();

  try {
    const usersRes = await pool.query(`
      SELECT id, name, email, reminder_time,
             last_notification_sent,
             last_streak_warning,
             last_reminder_time_sent
      FROM users
      WHERE daily_reminder = true
    `);

    for (const user of usersRes.rows) {
      try {
        const reminderTime = normalizeTime(user.reminder_time);
        const lastSentTime = normalizeTime(user.last_reminder_time_sent);

        if (currentTime !== reminderTime) continue;

        const alreadySentToday = user.last_notification_sent?.toISOString().slice(0, 10) === today;
        const alreadySentWarning = user.last_streak_warning?.toISOString().slice(0, 10) === today;
        const timeChanged = lastSentTime !== reminderTime;

        // 📌 Get all incomplete habits
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

        let incompleteHabits = habitsRes.rows;
        if (incompleteHabits.length === 0) continue;

        // ⚠️ 1. Separate "At Risk" habits
        const atRiskHabits = incompleteHabits.filter((h) => {
          if (!h.last_completed_date) return false;
          const diffDays = Math.floor((new Date(today) - new Date(h.last_completed_date)) / (1000 * 60 * 60 * 24));
          h.diffDays = diffDays;
          return diffDays >= 2 && diffDays <= 4;
        });

        // 🛑 2. Remove At-Risk habits from the standard Daily Reminder list
        // This prevents the same habit from appearing in two emails.
        const standardReminders = incompleteHabits.filter(
          (h) => !atRiskHabits.some((risk) => risk.id === h.id)
        );

        // ===============================
        // 📩 DAILY REMINDER (Standard only)
        // ===============================
        if (standardReminders.length > 0 && (!alreadySentToday || timeChanged)) {
          console.log(`✉️ Sending DAILY REMINDER (Standard) to ${user.email}`);
          await sendDailyReminder(user.email, user.name, standardReminders);
          await pool.query(
            `UPDATE users SET last_notification_sent = NOW(), last_reminder_time_sent = $1 WHERE id = $2`,
            [reminderTime, user.id]
          );
        }

        // ===============================
        // ⚠️ STREAK WARNING (At-Risk only)
        // ===============================
        if (atRiskHabits.length > 0 && (!alreadySentWarning || timeChanged)) {
          console.log(`🚨 Sending STREAK WARNING to ${user.email}`);
          await sendStreakWarning(user.email, user.name, atRiskHabits);
          await pool.query(
            `UPDATE users SET last_streak_warning = NOW() WHERE id = $1`,
            [user.id]
          );
        }

      } catch (err) {
        console.error(`[CRON] User ${user.email} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Cron engine error:", err.message);
  }
};

export const startCronJobs = () => {
  cron.schedule("* * * * *", () => { notifyDueUsers(); }, {
    scheduled: true,
    timezone: TIMEZONE
  });
};