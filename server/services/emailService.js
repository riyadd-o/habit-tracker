import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getBaseTemplate = (content, footerText = "Stay consistent. Small steps every day build powerful habits.") => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HabitFlow</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 40px 10px;">
        <tr>
            <td align="center">
                <!-- Main Card -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); overflow: hidden;">
                    
                    <!-- Gradient-like Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); background-color: #4f46e5; padding: 40px 0;">
                             <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">HabitFlow</h1>
                        </td>
                    </tr>

                    <!-- Content Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 30px 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                            <p style="margin: 0 0 8px 0; font-weight: 500; color: #4b5563;">${footerText}</p>
                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} HabitFlow. Building better futures.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

export const sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'https://habit-tracker-roan-tau.vercel.app'}/reset-password?token=${token}`;
  const brandColor = "#4f46e5";

  const content = `
    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">Hi there,</p>
    <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password. No worries, it happens to the best of us! Click the button below to secure your account.
    </p>

    <div style="text-align: center; margin-bottom: 20px;">
        <a href="${resetUrl}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">Reset My Password</a>
    </div>
    <p style="text-align: center; color: #ef4444; font-size: 13px; font-weight: 700; margin-bottom: 30px;">
        ⚠️ This link will expire in 30 minutes.
    </p>

    <p style="margin: 0; color: #9ca3af; font-size: 14px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
  `;

  const mailOptions = {
    from: `"HabitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - HabitFlow",
    html: getBaseTemplate(content, "Security matters. You're one step away from getting back on track."),
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Unified Habit Notification (Reminder + Streak Warning)
 * @param {string} email 
 * @param {string} name 
 * @param {Array} habits - All incomplete habits
 * @param {Array} atRiskHabits - Subset of habits that are at risk
 */
export const sendHabitNotification = async (email, name, habits, atRiskHabits = []) => {
  const isUrgent = atRiskHabits.length > 0;
  const brandColor = isUrgent ? "#f97316" : "#4f46e5"; // Orange for warning, Blue for reminder
  const accentColor = isUrgent ? "#ef4444" : "#7c3aed"; // Red for urgency, Purple for accent

  const habitsHtml = habits.map(h => {
    const atRisk = atRiskHabits.find(ar => ar.id === h.id);
    const badge = atRisk 
      ? `<div style="display: inline-block; background-color: #fee2e2; color: #ef4444; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; margin-bottom: 4px;">⚠️ AT RISK</div>`
      : `<div style="display: inline-block; background-color: #e0e7ff; color: #4338ca; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; margin-bottom: 4px;">KEEP IT UP</div>`;
    
    const riskMsg = atRisk 
      ? `<div style="color: #ef4444; font-size: 13px; font-weight: 600; margin-top: 4px; line-height: 1.4;">
          ${atRisk.diffDays >= 4 ? 'LAST CHANCE: Streak resets tomorrow!' : 'Streak at risk: Missing since ' + atRisk.diffDays + ' days.'}
         </div>`
      : '';

    return `
      <div style="background-color: ${atRisk ? '#fffaf0' : '#f9fafb'}; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; border: 1px solid ${atRisk ? '#ffedd5' : '#f3f4f6'};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              ${badge}
              <div style="font-weight: 700; color: #111827; font-size: 16px; margin-bottom: 2px;">${h.title}</div>
              <div style="color: ${atRisk ? '#ea580c' : '#4b5563'}; font-size: 14px; font-weight: 600;">🔥 ${h.streak || 0} day streak</div>
              ${riskMsg}
            </td>
            <td align="right" valign="top">
               <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid ${atRisk ? '#fdba74' : '#d1d5db'}; margin-top: 4px;"></div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }).join('');

  const headerTitle = isUrgent ? "⚠️ Streak Warning" : "Daily Reminder";
  const subTitle = isUrgent 
    ? `Hi <span style="color: ${brandColor}; font-weight: 700;">${name || 'there'}</span>, don't let your hard work go to waste!`
    : `Hi <span style="color: ${brandColor}; font-weight: 700;">${name || 'there'}</span>, consistency is your superpower.`;

  const content = `
    <h2 style="margin: 0 0 10px 0; color: ${brandColor}; font-size: 26px; font-weight: 800; text-align: center;">${headerTitle}</h2>
    <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 16px; text-align: center;">${subTitle}</p>

    <div style="margin-bottom: 30px;">
        <p style="margin: 0 0 15px 0; color: #111827; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; opacity: 0.7;">Incomplete Habits Today</p>
        ${habitsHtml}
    </div>

    <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'https://habit-tracker-roan-tau.vercel.app'}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 18px 40px; border-radius: 14px; box-shadow: 0 6px 20px ${isUrgent ? 'rgba(249, 115, 22, 0.3)' : 'rgba(79, 70, 229, 0.25)'};">Complete My Habits</a>
    </div>
  `;

  const footerText = isUrgent 
    ? "Consistency builds success. Don’t let your progress slip."
    : "Small steps every day build powerful habits. Keep going!";

  const mailOptions = {
    from: `"HabitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${isUrgent ? '⚠️ Streak Warning' : 'Daily Habit Reminder'} - HabitFlow`,
    html: getBaseTemplate(content, footerText),
  };

  return transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, name) => {
  const brandColor = "#4f46e5";
  const content = `
    <h2 style="margin: 0 0 15px 0; color: ${brandColor}; font-size: 26px; font-weight: 800; text-align: center;">Welcome to HabitFlow!</h2>
    <p style="margin: 0 0 25px 0; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
        Hi ${name || 'there'}, we're thrilled to have you here! You're now equipped to track your habits, build streaks, and transform your daily life.
    </p>

    <div style="background-color: #f5f3ff; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <p style="margin: 0 0 12px 0; color: #111827; font-weight: 700;">Quick Tips to Get Started:</p>
        <div style="margin-bottom: 8px; color: #4b5563; font-size: 15px;">• Create your first habit</div>
        <div style="margin-bottom: 8px; color: #4b5563; font-size: 15px;">• Set a daily reminder time</div>
        <div style="color: #4b5563; font-size: 15px;">• Check in daily to grow your streak</div>
    </div>

    <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || 'https://habit-tracker-roan-tau.vercel.app'}" style="display: inline-block; background-color: ${brandColor}; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 36px; border-radius: 12px;">Start My Journey</a>
    </div>
  `;

  const mailOptions = {
    from: `"HabitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to HabitFlow 🚀",
    html: getBaseTemplate(content, "Your journey starts today. Build habits that shape your future."),
  };

  return transporter.sendMail(mailOptions);
};

export const sendDailyReminder = async (email, name, habits) => {
  return sendHabitNotification(email, name, habits, []);
};

export const sendStreakWarning = async (email, name, habits) => {
  return sendHabitNotification(email, name, habits, habits);
};
