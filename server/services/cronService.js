import cron from 'node-cron';
import pkg from 'pg';
import dotenv from 'dotenv';
import { sendDailyReminder, sendStreakWarning } from './emailService.js';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const getTargetDateString = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

export const notifyDueUsers = async (force = false) => {
  console.log(`🚀 Running daily reminder engine... ${force ? "[FORCE MODE]" : ""}`);
  const now = new Date();
  
  const addisAbabaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Addis_Ababa',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  
  const [currentHour, currentMin] = addisAbabaTime.split(':').map(Number);
  const currentTimeTotalMinutes = currentHour * 60 + currentMin;

  const todayStr = getTargetDateString();
  const todayDate = new Date(todayStr);

  try {
    // We fetch dates as text to avoid timezone shifting in JS
    const usersRes = await pool.query(
      `SELECT id, name, email, reminder_time, 
              last_notification_sent::text as last_notification_sent_str, 
              last_streak_warning::text as last_streak_warning_str,
              last_reminder_time_sent 
       FROM users 
       WHERE daily_reminder = true`
    );
    const users = usersRes.rows;

    for (const user of users) {
      try {
        const rawTime = user.reminder_time || '08:00';
        const timeStr = rawTime.trim(); // Normalize
        const [h, m] = timeStr.split(':').map(Number);
        const userTimeTotalMinutes = h * 60 + m;
        
        // 1. Time Check: Must be at or after reminder time
        const isTimeReached = currentTimeTotalMinutes >= userTimeTotalMinutes;
        if (!isTimeReached && !force) continue;

        // 2. Already Sent Checks
        const alreadySentReminder = user.last_notification_sent_str === todayStr;
        const alreadySentWarning = user.last_streak_warning_str === todayStr;
        const lastSentTime = (user.last_reminder_time_sent || '').trim();
        const timeChanged = lastSentTime !== timeStr;

        // 3. Fetch Incomplete Habits
        const habitsRes = await pool.query(
          `SELECT h.id, h.title, h.streak, h.last_completed_date 
           FROM habits h 
           WHERE h.user_id = $1 AND h.frequency = 'daily'
             AND NOT EXISTS (
                SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.date = $2
             )`,
          [user.id, todayStr]
        );
        const incompleteHabits = habitsRes.rows;

        // 4. Identify At-Risk Habits
        const atRiskHabits = incompleteHabits.filter(h => {
          if (!h.streak || h.streak <= 0 || !h.last_completed_date) return false;
          
          const lastDate = new Date(h.last_completed_date);
          const diffTime = Math.abs(todayDate - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          h.diffDays = diffDays;
          return diffDays >= 2 && diffDays <= 4;
        });

        // 5. Decision Logic
        if (incompleteHabits.length > 0) {
          if (atRiskHabits.length > 0) {
            // STREAK WARNING
            if (!alreadySentWarning || timeChanged || force) {
              // UPDATE FIRST to prevent concurrent runs from double-sending
              await pool.query(
                `UPDATE users SET 
                  last_streak_warning = $1, 
                  last_notification_sent = $1, 
                  last_reminder_time_sent = $2 
                 WHERE id = $3`,
                [todayStr, timeStr, user.id]
              );

              console.log(`[CRON] 🚨 Sending streak warning to: ${user.email}`);
              await sendStreakWarning(user.email, user.name, atRiskHabits);
            } else {
              // console.log(`[CRON] Skip streak warning for ${user.email} (already sent today)`);
            }
          } else {
            // DAILY REMINDER
            if (!alreadySentReminder || timeChanged || force) {
              await pool.query(
                `UPDATE users SET 
                  last_notification_sent = $1, 
                  last_reminder_time_sent = $2 
                 WHERE id = $3`,
                [todayStr, timeStr, user.id]
              );

              console.log(`[CRON] ✉️ Sending daily reminder to: ${user.email}`);
              await sendDailyReminder(user.email, user.name, incompleteHabits);
            } else {
              // console.log(`[CRON] Skip daily reminder for ${user.email} (already sent today)`);
            }
          }
        } else {
          // No incomplete habits - Mark as processed for today
          if ((!alreadySentReminder && !alreadySentWarning) || timeChanged) {
            if (!force) {
              await pool.query(
                `UPDATE users SET 
                  last_notification_sent = $1, 
                  last_reminder_time_sent = $2 
                 WHERE id = $3`,
                [todayStr, timeStr, user.id]
              );
            }
          }
        }
      } catch (innerErr) {
        console.error(`[CRON] User ${user.email} processing failed:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error('[CRON] engine error:', err);
  }
};

export const startCronJobs = () => {
  console.log('⏰ Initializing Smart Reminder & Streak Guard (Africa/Addis_Ababa)');
  cron.schedule('* * * * *', () => {
    notifyDueUsers();
  }, {
    scheduled: true,
    timezone: "Africa/Addis_Ababa"
  });
  console.log('✅ Monitoring habits and streaks in real-time.');
};
