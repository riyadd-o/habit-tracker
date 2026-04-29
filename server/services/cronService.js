import cron from "node-cron";
import pkg from "pg";
import dotenv from "dotenv";
import {
  sendDailyReminder,
  sendStreakWarning,
  sendWeeklyReport,
} from "./emailService.js";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const TIMEZONE = "Africa/Addis_Ababa";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Convert any stored time format → "HH:mm" (24-hour) */
const normalizeTime = (time) => {
  if (!time) return "08:00";

  const str = String(time).trim();

  if (str.includes("AM") || str.includes("PM")) {
    const [t, mod] = str.split(" ");
    let [h, m] = t.split(":");
    h = parseInt(h, 10);
    if (mod === "PM" && h !== 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}`;
  }

  return str.slice(0, 5); // already "HH:mm" or "HH:mm:ss"
};

/** Current wall-clock time in the project timezone → "HH:mm" */
const getCurrentTime = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

/** Today's date in the project timezone → "YYYY-MM-DD" */
const getToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

/** ISO weekday (1 = Monday … 7 = Sunday) in project timezone */
const getDayOfWeek = () => {
  const now = new Date();
  // Use a locale-independent trick: format in the target TZ and parse
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "long",
  }).formatToParts(now);
  const day = parts.find((p) => p.type === "weekday").value;
  const map = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };
  return map[day];
};

// ─────────────────────────────────────────────
// Daily reminder + streak warning
// ─────────────────────────────────────────────

export const notifyDueUsers = async () => {
  const currentTime = getCurrentTime();
  const today = getToday();

  console.log(`\n⏰ CRON → ${currentTime} (${today})`);

  try {
    const usersRes = await pool.query(`
      SELECT id, name, email, reminder_time
      FROM users
      WHERE daily_reminder = true
        AND reminder_time IS NOT NULL
    `);

    for (const user of usersRes.rows) {
      try {
        const reminderTime = normalizeTime(user.reminder_time);

        // Only fire at the exact scheduled minute
        if (currentTime !== reminderTime) continue;

        console.log(`👤 Processing ${user.email} (reminder: ${reminderTime})`);

        // ── DAILY REMINDER LOCK ──────────────────────────────────────────
        // The key insight: lock on (user_id, date, reminderTime).
        // - New day  → date changes          → allow
        // - Same day, same time changed      → reminderTime changes  → allow
        // - Same day, same time, re-run      → all match             → block
        // ────────────────────────────────────────────────────────────────
        const dailyLock = await pool.query(
          `UPDATE users
             SET last_notification_sent    = NOW(),
                 last_reminder_time_sent   = $1,
                 last_notification_date    = $3
           WHERE id = $2
             AND (
               last_notification_date IS NULL
               OR last_notification_date   != $3
               OR last_reminder_time_sent  != $1
             )
           RETURNING id`,
          [reminderTime, user.id, today]
        );

        if (dailyLock.rowCount === 0) {
          console.log(`🛑 DAILY BLOCKED (already sent today at ${reminderTime}) → ${user.email}`);
          // Still check streak warning below even if daily was blocked
        } else {
          // Fetch incomplete habits only when we are going to send
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
            console.log(`✅ All habits done → ${user.email}`);
          } else {
            console.log(`📧 DAILY SENT → ${user.email} (${incompleteHabits.length} habits)`);
            await sendDailyReminder(user.email, user.name, incompleteHabits);
          }
        }

        // ── STREAK WARNING LOCK ──────────────────────────────────────────
        // Independent of daily reminder: one streak warning per calendar day.
        // ────────────────────────────────────────────────────────────────

        // Fetch incomplete habits for at-risk calculation
        const habitsForWarning = await pool.query(
          `SELECT h.id, h.title, h.streak, h.last_completed_date
             FROM habits h
            WHERE h.user_id = $1
              AND NOT EXISTS (
                SELECT 1 FROM habit_logs hl
                 WHERE hl.habit_id = h.id AND hl.date = $2
              )`,
          [user.id, today]
        );

        const atRiskHabits = habitsForWarning.rows
          .filter((h) => {
            if (!h.last_completed_date) return false;
            const diffDays = Math.floor(
              (new Date(today) - new Date(h.last_completed_date)) /
              (1000 * 60 * 60 * 24)
            );
            // diffDays 2–4: streak will break if not done today
            return diffDays >= 2 && diffDays <= 4;
          })
          .map((h) => ({
            ...h,
            diffDays: Math.floor(
              (new Date(today) - new Date(h.last_completed_date)) /
              (1000 * 60 * 60 * 24)
            ),
          }));

        if (atRiskHabits.length > 0) {
          const warningLock = await pool.query(
            `UPDATE users
               SET last_streak_warning      = NOW(),
                   last_streak_warning_date = $2
             WHERE id = $1
               AND (
                 last_streak_warning_date IS NULL
                 OR last_streak_warning_date != $2
               )
             RETURNING id`,
            [user.id, today]
          );

          if (warningLock.rowCount > 0) {
            console.log(`🚨 WARNING SENT → ${user.email} (${atRiskHabits.length} at risk)`);
            await sendStreakWarning(user.email, user.name, atRiskHabits);
          } else {
            console.log(`🛑 WARNING BLOCKED (already sent today) → ${user.email}`);
          }
        }
      } catch (err) {
        console.error(`❌ User ${user.email} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Daily cron error:", err.message);
  }
};

// ─────────────────────────────────────────────
// Weekly report  (every Sunday at 20:00 local)
// ─────────────────────────────────────────────

export const sendWeeklyReports = async () => {
  const today = getToday();
  const currentTime = getCurrentTime();

  console.log(`\n📊 WEEKLY REPORT CRON → ${currentTime} (${today})`);

  try {
    // Calculate the start of the current week (Monday)
    const todayDate = new Date(today);
    const dayOfWeek = todayDate.getDay(); // 0 Sun, 1 Mon…
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() - diffToMonday);
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const usersRes = await pool.query(`
      SELECT id, name, email
      FROM users
    `);

    for (const user of usersRes.rows) {
      try {
        // ── WEEKLY REPORT LOCK: one per calendar week ──────────────────
        const weeklyLock = await pool.query(
          `UPDATE users
             SET last_weekly_report_date = $2
           WHERE id = $1
             AND (
               last_weekly_report_date IS NULL
               OR last_weekly_report_date != $2
             )
           RETURNING id`,
          [user.id, weekStartStr]
        );

        if (weeklyLock.rowCount === 0) {
          console.log(`🛑 WEEKLY BLOCKED → ${user.email}`);
          continue;
        }

        // ── Fetch all habits for this user ─────────────────────────────
        const habitsRes = await pool.query(
          `SELECT h.id, h.title, h.streak,
                  COUNT(hl.id) AS completions_this_week
             FROM habits h
             LEFT JOIN habit_logs hl
               ON hl.habit_id = h.id
              AND hl.date >= $2
              AND hl.date <= $3
            WHERE h.user_id = $1
            GROUP BY h.id, h.title, h.streak
            ORDER BY completions_this_week DESC`,
          [user.id, weekStartStr, today]
        );

        const habits = habitsRes.rows;

        if (habits.length === 0) {
          console.log(`⏭ No habits → skip weekly for ${user.email}`);
          continue;
        }

        // Days elapsed in the current week (1–7)
        const daysElapsed = diffToMonday + 1;

        const totalPossible = habits.length * daysElapsed;
        const totalCompleted = habits.reduce(
          (sum, h) => sum + parseInt(h.completions_this_week, 10),
          0
        );
        const completionRate =
          totalPossible > 0
            ? Math.round((totalCompleted / totalPossible) * 100)
            : 0;

        console.log(`📊 WEEKLY SENT → ${user.email}`);
        await sendWeeklyReport(user.email, user.name, habits, {
          weekStart: weekStartStr,
          weekEnd: today,
          totalCompleted,
          totalPossible,
          completionRate,
          daysElapsed,
        });
      } catch (err) {
        console.error(`❌ Weekly report failed for ${user.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Weekly cron error:", err.message);
  }
};

// ─────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────

export const startCronJobs = () => {
  // Every minute → daily reminder + streak warning
  cron.schedule(
    "* * * * *",
    () => {
      notifyDueUsers();
    },
    { timezone: TIMEZONE }
  );

  // Every Sunday at 20:00 → weekly report
  cron.schedule(
    "0 20 * * 0",
    () => {
      sendWeeklyReports();
    },
    { timezone: TIMEZONE }
  );

  console.log("✅ Cron jobs started (daily + weekly, duplicate-safe)");
};
