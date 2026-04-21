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

export const notifyDueUsers = async (force = false) => {
  console.log(`🚀 Running daily reminder cron... ${force ? "[FORCE MODE]" : ""}`);
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
      
      const isPastDue = (currentHour > h) || (currentHour === h && currentMin >= m);
      
      // Force mode ONLY bypasses the "already sent today" check
      const shouldNotify = isPastDue && (force || !alreadySentToday);

      if (alreadySentToday && !force) {
        console.log(`[CRON] Skip ${user.email}: Already notified today.`);
      } else if (!isPastDue) {
        console.log(`[CRON] Skip ${user.email}: Scheduled for ${timeStr} (Current: ${addisAbabaTime})`);
      }
      
      return shouldNotify;
    });

    if (activeUsers.length === 0) {
      console.log(`[CRON] No users due for notification (Time: ${addisAbabaTime}${force ? ", Force Mode On" : ""})`);
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
        
        // ONLY send if there are pending habits (even in force mode, as requested)
        if (pendingCount > 0) {
          console.log(`[CRON] ${force ? "[FORCE] " : ""}Sending reminder to:`, user.email);
          
          // Fetch the highest current streak among active daily habits to motivate the user
          const streakRes = await pool.query(
            "SELECT MAX(streak) as max_streak FROM habits WHERE user_id = $1 AND frequency = 'daily'",
            [user.id]
          );
          const maxStreak = parseInt(streakRes.rows[0].max_streak || 0, 10);
          
          // Send email
          await sendDailyReminder(user.email, user.name, pendingCount, { streak: maxStreak, isAtRisk: false });

          // Update last sent date (unless forced, so we can test repeatedly)
          if (!force) {
            await pool.query('UPDATE users SET last_notification_sent = $1 WHERE id = $2', [todayStr, user.id]);
          }
        } else {
          console.log(`[CRON] Skipped ${user.email}: All habits completed today.`);
          // Still mark as "processed" today so we don't spam them if they complete/uncomplete
          if (!force) {
            await pool.query('UPDATE users SET last_notification_sent = $1 WHERE id = $2', [todayStr, user.id]);
          }
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
