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
  console.log(`🚀 Running daily reminder & streak warning engine... ${force ? "[FORCE MODE]" : ""}`);
  const now = new Date();
  
  const addisAbabaTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Addis_Ababa',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(now);
  
  const [currentHour, currentMin] = addisAbabaTime.split(':').map(Number);
  const todayStr = getTargetDateString();
  const todayDate = new Date(todayStr);

  try {
    const usersRes = await pool.query(
      `SELECT id, name, email, reminder_time, last_notification_sent, last_reminder_time_sent 
       FROM users 
       WHERE daily_reminder = true`
    );
    const users = usersRes.rows;

    const scheduledUsers = users.filter(user => {
      if (force) return true;

      const timeStr = user.reminder_time || '08:00';
      const [h, m] = timeStr.split(':').map(Number);
      
      // 1. Time Match Check (Strict ±1 minute window)
      // Check if current hour matches AND current minute is exactly h:m
      const isExactlyTime = (currentHour === h && currentMin === m);
      
      // 2. Date/Time Tracking Check
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
      
      // Smart Condition:
      // Send ONLY if:
      // - Current time is exactly the reminder time
      // AND (never sent today OR user changed their reminder time since last send)
      const shouldNotify = isExactlyTime && (!alreadySentToday || user.last_reminder_time_sent !== timeStr);

      if (alreadySentToday && user.last_reminder_time_sent === timeStr && isExactlyTime) {
        // console.log(`[CRON] Skip ${user.email}: Already notified for ${timeStr} today.`);
      }
      
      return shouldNotify;
    });

    if (scheduledUsers.length === 0) return;

    for (const user of scheduledUsers) {
      try {
        // 1. Fetch Incomplete Habits
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

        // 2. Identify At-Risk Habits (Streak Warning)
        const atRiskHabits = incompleteHabits.filter(h => {
          if (!h.streak || h.streak <= 0 || !h.last_completed_date) return false;
          
          const lastDate = new Date(h.last_completed_date);
          const diffTime = Math.abs(todayDate - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          h.diffDays = diffDays;
          return diffDays === 2 || diffDays === 3;
        });

        // 3. Smart Send: ONLY if there are pending habits
        if (incompleteHabits.length > 0) {
          if (atRiskHabits.length > 0) {
            console.log(`[CRON] 🚨 Sending streak warning to: ${user.email}`);
            await sendStreakWarning(user.email, user.name, atRiskHabits);
          } else {
            console.log(`[CRON] ✉️ Sending daily reminder to: ${user.email}`);
            await sendDailyReminder(user.email, user.name, incompleteHabits);
          }

          // 4. Update tracking columns immediately to prevent re-sending in same minute
          await pool.query(
            'UPDATE users SET last_notification_sent = $1, last_reminder_time_sent = $2 WHERE id = $3', 
            [todayStr, user.reminder_time || '08:00', user.id]
          );
        } else {
          // Marking as processed for this time slot even if no habits are incomplete
          // to ensure we don't spam or waste queries if they check/uncheck habits
          if (!force) {
            await pool.query(
              'UPDATE users SET last_notification_sent = $1, last_reminder_time_sent = $2 WHERE id = $3', 
              [todayStr, user.reminder_time || '08:00', user.id]
            );
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
