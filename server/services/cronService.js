import cron from 'node-cron';
import pkg from 'pg';
import dotenv from 'dotenv';
import { sendDailyReminder, sendWeeklySummary } from './emailService.js';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const startCronJobs = () => {
  console.log('⏰ Initializing production cron jobs...');
  console.log('✅ Cron job started');

  // Daily Reminder: Runs every minute to check user-specific times
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const currentHourMinutes = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayStr = getLocalToday();

    try {
      // Find users with daily_reminder ON
      const usersRes = await pool.query(
        `SELECT id, name, email, reminder_time, last_notification_sent 
         FROM users 
         WHERE daily_reminder = true`
      );
      const users = usersRes.rows;

      const activeUsers = users.filter(user => {
        const userTime = user.reminder_time ? user.reminder_time.substring(0, 5) : '08:00';
        
        let alreadySentToday = false;
        if (user.last_notification_sent) {
          const lastSentStr = new Date(user.last_notification_sent).toISOString().split('T')[0];
          if (lastSentStr === todayStr) {
            alreadySentToday = true;
          }
        }
        
        return userTime === currentHourMinutes && !alreadySentToday;
      });

      if (activeUsers.length === 0) {
        return; // No users to notify at this exact minute
      }
      
      console.log(`[CRON] Daily Reminder: Triggered at ${currentHourMinutes} for ${activeUsers.length} user(s).`);

      for (const user of activeUsers) {
        // Count uncompleted habits for the user today
        const countRes = await pool.query(
          `SELECT count(*) FROM habits h 
           WHERE h.user_id = $1 
             AND h.frequency = 'daily'
             AND NOT EXISTS (
                SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.date = $2
             )`,
          [user.id, todayStr]
        );

        const pendingCount = parseInt(countRes.rows[0].count, 10);
        
        if (pendingCount > 0) {
          try {
            // Get streak info for the email
            let maxStreak = 0;
            let isAtRisk = false;

            const habitsRes = await pool.query(
              `SELECT id, streak, last_completed_date 
               FROM habits 
               WHERE user_id = $1 AND frequency = 'daily'`,
              [user.id]
            );

            for (const habit of habitsRes.rows) {
              if (habit.streak > maxStreak) {
                maxStreak = habit.streak;
              }
              if (habit.last_completed_date) {
                const todayVal = new Date();
                todayVal.setHours(0, 0, 0, 0);
                const lastVal = new Date(habit.last_completed_date);
                lastVal.setHours(0, 0, 0, 0);
                const diffDays = Math.round((todayVal - lastVal) / 86400000);
                if (diffDays >= 2 && diffDays <= 4) {
                  isAtRisk = true;
                }
              }
            }

            const streakData = { streak: maxStreak, isAtRisk };

            await sendDailyReminder(user.email, user.name, pendingCount, streakData);
            console.log(`[CRON] Daily Reminder: ✉️ Email sent to ${user.email} at ${currentHourMinutes}`);

            // Mark as sent to prevent duplicates
            await pool.query(
              'UPDATE users SET last_notification_sent = CURRENT_DATE WHERE id = $1',
              [user.id]
            );

          } catch (emailErr) {
            console.error(`[CRON] Daily Reminder: Failed to send email to ${user.email}`, emailErr);
          }
        } else {
          console.log(`[CRON] Daily Reminder: Skipped ${user.email} (all habits completed).`);
        }
      }
    } catch (err) {
      console.error('[CRON] Daily Reminder: Error running job', err);
    }
  });

  // Weekly Summary: Runs at 9:00 AM every Sunday
  cron.schedule('0 9 * * 0', async () => {
    console.log('[CRON] Weekly Summary Running...');
    
    try {
      // Find users with email_notifications ON
      const usersRes = await pool.query("SELECT id, name, email FROM users WHERE email_notifications = true");
      const users = usersRes.rows;

      if (users.length === 0) {
        console.log('[CRON] Weekly Summary: No users found.');
        return;
      }
      
      console.log(`[CRON] Weekly Summary: Processing for ${users.length} user(s).`);

      for (const user of users) {
        // Get completed count for the past 7 days
        const logsRes = await pool.query(
          `SELECT count(*) FROM habit_logs hl
           JOIN habits h ON hl.habit_id = h.id
           WHERE h.user_id = $1
             AND hl.date >= current_date - interval '7 days'`,
          [user.id]
        );

        const completedCount = parseInt(logsRes.rows[0].count, 10);

        // Get total active streaks
        const streaksRes = await pool.query(
          `SELECT count(*) FROM habits 
           WHERE user_id = $1 AND streak > 0`,
          [user.id]
        );

        const streaksCount = parseInt(streaksRes.rows[0].count, 10);

        try {
          await sendWeeklySummary(user.email, user.name, completedCount, streaksCount);
          console.log(`[CRON] Weekly Summary: ✉️ Email sent to ${user.email}`);
        } catch (emailErr) {
          console.error(`[CRON] Weekly Summary: Failed to send email to ${user.email}`, emailErr);
        }
      }
    } catch (err) {
      console.error('[CRON] Weekly Summary: Error running job', err);
    }
  });

  console.log('✅ Production Cron jobs securely scheduled.');
};
