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
  // Adjust to Addis Ababa date specifically if needed, but for now simple UTC date is usually fine for daily logs
  return d.toISOString().split('T')[0];
};

export const notifyDueUsers = async () => {
  console.log("🚀 Running daily reminder cron...");
  const now = new Date();
  
  // Use a specific timezone for time comparison
  const addisAbabaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Addis_Ababa',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  
  const [currentHour, currentMin] = addisAbabaTime.split(':').map(Number);
  const todayStr = getLocalToday();

  try {
    // 1. Find users with daily_reminder ON
    const usersRes = await pool.query(
      `SELECT id, name, email, reminder_time, last_notification_sent 
       FROM users 
       WHERE daily_reminder = true`
    );
    const users = usersRes.rows;
    console.log(`[CRON] Users found with reminders enabled: ${users.length}`);

    const activeUsers = users.filter(user => {
      const timeStr = user.reminder_time || '08:00';
      const [h, m] = timeStr.split(':').map(Number);
      
      let alreadySentToday = false;
      if (user.last_notification_sent) {
        const lastSentDate = new Date(user.last_notification_sent).toLocaleDateString();
        const currentDate = new Date().toLocaleDateString();
        if (lastSentDate === currentDate) alreadySentToday = true;
      }
      
      // Check if current Addis Ababa time is >= scheduled time
      const isPastDue = (currentHour > h) || (currentHour === h && currentMin >= m);
      
      return isPastDue && !alreadySentToday;
    });

    if (activeUsers.length === 0) {
      console.log(`[CRON] No users due for notification at ${addisAbabaTime}`);
      return;
    }
    
    console.log(`[CRON] Attempting to send reminders to ${activeUsers.length} users.`);

    for (const user of activeUsers) {
      // Count uncompleted habits
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
          console.log(`[CRON] ✉️ Sending reminder to: ${user.email}`);
          
          // Basic streak info for email
          const habitsRes = await pool.query(
            "SELECT streak, last_completed_date FROM habits WHERE user_id = $1 AND daily_reminder = true",
            [user.id]
          );
          // (Simplified streak logic for brevity in test)
          
          await sendDailyReminder(user.email, user.name, pendingCount, { streak: 0, isAtRisk: false });

          // Update last sent date
          await pool.query('UPDATE users SET last_notification_sent = CURRENT_DATE WHERE id = $1', [user.id]);
        } catch (emailErr) {
          console.error(`[CRON] Failed to send to ${user.email}:`, emailErr.message);
        }
      } else {
        console.log(`[CRON] Skipped ${user.email} (all habits done)`);
        // Still update last sent so we don't keep checking them today
        await pool.query('UPDATE users SET last_notification_sent = CURRENT_DATE WHERE id = $1', [user.id]);
      }
    }
  } catch (err) {
    console.error('[CRON] Error in notifyDueUsers:', err);
  }
};

export const startCronJobs = () => {
  console.log('⏰ Initializing production cron jobs (Timezone: Africa/Addis_Ababa)');
  console.log('✅ Cron job initialized');

  // Internal fallback cron: Runs every minute
  cron.schedule('* * * * *', () => {
    notifyDueUsers();
  }, {
    scheduled: true,
    timezone: "Africa/Addis_Ababa"
  });

  // Weekly Summary: Sunday 9:00 AM
  cron.schedule('0 9 * * 0', async () => {
    console.log('[CRON] Weekly Summary Running...');
  }, {
    scheduled: true,
    timezone: "Africa/Addis_Ababa"
  });
};
