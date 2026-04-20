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

const getBaseTemplate = (content, footerText = "You’re receiving this because notifications are enabled") => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HabitFlow</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Card -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 40px 0; border-bottom: 2px solid #f3f4f6;">
                            <img src="https://i.imgur.com/84XH28D.png" alt="HabitFlow Logo" width="280" style="display:block; margin: 0 auto; max-width: 80%; height: auto; border: 0; outline: none; text-decoration: none;" />
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 24px 20px; color: #9ca3af; font-size: 13px; line-height: 1.5;">
                            <p style="margin: 0 0 8px 0;">${footerText}</p>
                            <p style="margin: 0;">&copy; ${new Date().getFullYear()} HabitFlow. All rights reserved.</p>
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

  const content = `
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.5;">Hi there,</p>
    <p style="margin: 0 0 25px 0; color: #444444; font-size: 16px; line-height: 1.5;">
        You requested to reset your password for your Habit Tracker account. Click the button below to set a new password. This link will expire in 1 hour.
    </p>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
        <tr>
            <td align="center">
                <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 30px; border-radius: 6px;">Reset Password</a>
            </td>
        </tr>
    </table>

    <p style="margin: 0; color: #888888; font-size: 14px; line-height: 1.5;">
        If you didn't request this, you can safely ignore this email.
    </p>
  `;

  const mailOptions = {
    from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - Habit Tracker",
    html: getBaseTemplate(content),
  };

  console.log(`📧 Sending reset password email to: ${email}`);
  return transporter.sendMail(mailOptions);
};

export const sendDailyReminder = async (email, name, pendingCount, streakData) => {
  let streakHtml = '';
  if (streakData) {
    if (streakData.isAtRisk) {
      streakHtml = `<p style="margin: 10px 0 0 0; color: #d97706; font-size: 15px; font-weight: 600;">⚠️ Your streak is at risk. Complete today to restore it</p>`;
    } else if (streakData.streak > 0) {
      streakHtml = `<p style="margin: 10px 0 0 0; color: #e85d04; font-size: 15px; font-weight: 600;">🔥 You're on a ${streakData.streak} day streak</p>`;
    }
  }

  const content = `
    <!-- Greeting -->
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
    
    <!-- Main Message -->
    <p style="margin: 0 0 25px 0; color: #444444; font-size: 16px; line-height: 1.5;">
        It's time to work on your goals! Consistency is the key to building lasting habits, and we are here to help you stay on track.
    </p>

    <!-- Highlight Section -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f7fb; border-radius: 6px; margin-bottom: 25px;">
        <tr>
            <td style="padding: 20px;">
                <p style="margin: 0; color: #111111; font-size: 16px; font-weight: 600;">Incomplete Habits: ${pendingCount}</p>
                ${streakHtml}
            </td>
        </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <a href="${process.env.CLIENT_URL || 'https://habit-tracker-roan-tau.vercel.app'}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 30px; border-radius: 6px;">Complete Your Habits</a>
            </td>
        </tr>
    </table>
  `;

  const mailOptions = {
    from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Daily Habit Reminder - Habit Tracker",
    html: getBaseTemplate(content),
  };

  console.log(`📧 Sending daily reminder email to: ${email}`);
  return transporter.sendMail(mailOptions);
};

export const sendWeeklySummary = async (email, name, completedCount, streaks) => {
  const content = `
    <!-- Greeting -->
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
    
    <!-- Main Message -->
    <p style="margin: 0 0 25px 0; color: #444444; font-size: 16px; line-height: 1.5;">
        Here is a quick look at your progress for the past week. Let's see how much momentum you've built!
    </p>

    <!-- Highlight Section -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f7fb; border-radius: 6px; margin-bottom: 25px;">
        <tr>
            <td style="padding: 20px;">
                <p style="margin: 0 0 10px 0; color: #111111; font-size: 16px; font-weight: 600;">Total habits completed: ${completedCount}</p>
                <p style="margin: 0; color: #111111; font-size: 16px; font-weight: 600;">Active streaks: ${streaks} 🔥</p>
            </td>
        </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
            <td align="center">
                <a href="${process.env.CLIENT_URL || 'https://habit-tracker-roan-tau.vercel.app'}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 14px 30px; border-radius: 6px;">View Your Progress</a>
            </td>
        </tr>
    </table>
  `;

  const mailOptions = {
    from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Weekly Summary - Habit Tracker",
    html: getBaseTemplate(content),
  };

  console.log(`📧 Sending weekly summary email to: ${email}`);
  return transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, name) => {
  const content = `
    <!-- Greeting -->
    <div style="text-align: left;">
      <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.5;">Hi ${name || 'there'},</p>
      
      <!-- Main Message -->
      <p style="margin: 0 0 25px 0; color: #444444; font-size: 16px; line-height: 1.5;">
          Welcome to Habit Tracker! You're one step closer to building better habits. We're excited to help you stay consistent and reach your goals.
      </p>

      <!-- Highlight Section -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f7fb; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #4f46e5;">
          <tr>
              <td style="padding: 20px;">
                  <p style="margin: 0 0 12px 0; color: #111111; font-size: 16px; font-weight: 700;">🚀 Here's what you can do:</p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                          <td style="padding-bottom: 8px; color: #444444; font-size: 15px;">✅ <strong>Track daily habits</strong> - Stay on top of your routine</td>
                      </tr>
                      <tr>
                          <td style="padding-bottom: 8px; color: #444444; font-size: 15px;">🔥 <strong>Build streaks</strong> - Watch your progress grow</td>
                      </tr>
                      <tr>
                          <td style="padding-bottom: 0; color: #444444; font-size: 15px;">📅 <strong>Stay consistent</strong> - Be the best version of yourself</td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>

      <!-- CTA Button -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
              <td align="center" style="padding-top: 10px;">
                  <a href="${process.env.CLIENT_URL || 'https://habit-tracker-roan-tau.vercel.app'}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 35px; border-radius: 8px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">Start Tracking Now</a>
              </td>
          </tr>
      </table>
    </div>
  `;

  const mailOptions = {
    from: `"Habit Tracker" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Habit Tracker 🚀",
    html: getBaseTemplate(content, "You're receiving this email because you created an account"),
  };

  console.log(`📧 Sending welcome email to: ${email}`);
  return transporter.sendMail(mailOptions);
};

