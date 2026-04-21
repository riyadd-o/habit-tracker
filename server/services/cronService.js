import cron from 'node-cron';
import pkg from 'pg';
import dotenv from 'dotenv';
import { sendDailyReminder } from './emailService.js';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Returns today's date string in YYYY-MM-DD for the target timezone
 */
const getTargetDateString = () => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
};

export const notifyDueUsers = async () => {
  console.log("🚀 Running daily reminder cron...");
  const now = new Date();
  
  // Explicit Addis Ababa time check
  const addisAbabaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Addis_Ababa',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  
  const [currentHour, currentMin] = addisAbabaTime.split(':').map(Number);
  const todayStr = getTargetDateString();

  try {
    // 1. Find users with daily_reminder ON
    const usersRes = await pool.query(
      `SELECT id, name, email, reminder_time, last_notification_sent 
       FROM users 
       WHERE daily_reminder = true`
    );
    const users = usersRes.rows;
    console.log("Users found:", users.length);

    if (users.length === 0) {
      console.log("[CRON] No users have reminders enabled.");
      return;
    }

    const activeUsers = users.filter(user => {
      const timeStr = user.reminder_time || '08:00';
      const [h, m] = timeStr.split(':').map(Number);
      
      let alreadySentToday = false;
      if (user.last_notification_sent) {
        // More robust comparison: format last_notification_sent to YYYY-MM-DD in the same timezone
        const lastSentDateStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Africa/Addis_Ababa',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(new Date(user.last_notification_sent));
        
        if (lastSentDateStr === todayStr) {
          alreadySentToday = true;
        }
      }
      
      // Check if current time is >= scheduled time
      const isPastDue = (currentHour > h) || (currentHour === h && currentMin >= m);
      
      return isPastDue && !alreadySentToday;
    });

    if (activeUsers.length === 0) {
      console.log(`[CRON] No users due for notification at current time (${addisAbabaTime})`);
      return;
    }
    
    console.log(`[CRON] Attempting to send reminders to ${activeUsers.length} users.`);

    for (const user of activeUsers) {
      try {
        // Count uncompleted habits for today
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
          console.log("Sending reminder to:", user.email);
          
          // Send email
          await sendDailyReminder(user.email, user.name, pendingCount, { streak: 0, isAtRisk: false });

          // Update last sent date using explicit target date to avoid server local time issues
          await pool.query('UPDATE users SET last_notification_sent = $1 WHERE id = $2', [todayStr, user.id]);
        } else {
          console.log(`[CRON] Skipped ${user.email} (all habits done)`);
          // Still mark as "processed" today so we don't spam them if they complete/uncomplete
          await pool.query('UPDATE users SET last_notification_sent = $1 WHERE id = $2', [todayStr, user.id]);
        }
      } catch (innerErr) {
        console.error(`[CRON] Failed to process user ${user.email}:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error('[CRON] Error in notifyDueUsers:', err);
  }
};

export const startCronJobs = () => {
  console.log('⏰ Initializing production cron jobs (Timezone: Africa/Addis_Ababa)');
  console.log("Cron job initialized");

  // Every minute internal check (helps if Render wakes up mid-day)
  cron.schedule('* * * * *', () => {
    notifyDueUsers();
  }, {
    scheduled: true,
    timezone: "Africa/Addis_Ababa"
  });

  console.log('✅ Cron system ready and monitoring every minute.');
};
