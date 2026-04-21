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
  console.log(`🚀 Running daily reminder engine... ${force ? "[FORCE MODE]" : ""}`);
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
    // 1. Find users with daily_reminder enabled
    const usersRes = await pool.query(
      `SELECT id, name, email, reminder_time, last_notification_sent, last_reminder_time_sent 
       FROM users 
       WHERE daily_reminder = true`
    );
    const users = usersRes.rows;
    console.log(`[CRON] Processing ${users.length} users...`);

    const activeUsers = users.filter(user => {
      if (force) return true;

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
      
      // Smart Logic: Send if past due AND (not sent today OR sent today but user changed their time)
      const shouldNotify = isPastDue && (!alreadySentToday || user.last_reminder_time_sent !== timeStr);

      if (alreadySentToday && user.last_reminder_time_sent === timeStr) {
        // console.log(`[CRON] Skip ${user.email}: Already notified for ${timeStr} today.`);
      } else if (!isPastDue) {
        // console.log(`[CRON] Skip ${user.email}: Scheduled for ${timeStr} (Current: ${addisAbabaTime})`);
      }
      
      return shouldNotify;
    });

    if (activeUsers.length === 0) {
      console.log(`[CRON] No users due for notification at ${addisAbabaTime}`);
      return;
    }
    
    console.log(`[CRON] Checking habits for ${activeUsers.length} scheduled users.`);

    for (const user of activeUsers) {
      try {
        // 2. Query incomplete habits for THIS EXACT USER for TODAY
        const habitsRes = await pool.query(
          `SELECT h.title, h.streak 
           FROM habits h 
           WHERE h.user_id = $1 
             AND h.frequency = 'daily'
             AND NOT EXISTS (
                SELECT 1 FROM habit_logs hl WHERE hl.habit_id = h.id AND hl.date = $2
             )`,
          [user.id, todayStr]
        );

        const incompleteHabits = habitsRes.rows;
        
        // 3. Smart Send: ONLY send if there are pending habits
        if (incompleteHabits.length > 0) {
          console.log(`[CRON] ✉️ Sending reminder to: ${user.email} (${incompleteHabits.length} habits)`);
          
          await sendDailyReminder(user.email, user.name, incompleteHabits);

          // 4. Update tracking columns
          await pool.query(
            'UPDATE users SET last_notification_sent = $1, last_reminder_time_sent = $2 WHERE id = $3', 
            [todayStr, user.reminder_time || '08:00', user.id]
          );
        } else {
          // If all habits done, we still mark it as "processed" for this time slot 
          // so we don't keep querying their habits every minute today for this reminder_time.
          if (!force) {
             await pool.query(
               'UPDATE users SET last_notification_sent = $1, last_reminder_time_sent = $2 WHERE id = $3', 
               [todayStr, user.reminder_time || '08:00', user.id]
             );
          }
        }
      } catch (innerErr) {
        console.error(`[CRON] Failed to process ${user.email}:`, innerErr.message);
      }
    }
  } catch (err) {
    console.error('[CRON] Engine error:', err);
  }
};

export const startCronJobs = () => {
  console.log('⏰ Initializing Smart Reminder Engine (Timezone: Africa/Addis_Ababa)');
  console.log("Cron job initialized");

  // Run every minute to catch exact reminder times
  cron.schedule('* * * * *', () => {
    notifyDueUsers();
  }, {
    scheduled: true,
    timezone: "Africa/Addis_Ababa"
  });

  console.log('✅ Monitoring daily habits in real-time.');
};
