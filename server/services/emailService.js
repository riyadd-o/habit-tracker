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

// ─────────────────────────────────────────────
// Base HTML template
// ─────────────────────────────────────────────

const getBaseTemplate = (
  content,
  footerText = "Stay consistent. Small steps every day build powerful habits."
) => `
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

                    <!-- Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); background-color: #4f46e5; padding: 40px 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">HabitFlow</h1>
                        </td>
                    </tr>

                    <!-- Body -->
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

// ─────────────────────────────────────────────
// Password reset
// ─────────────────────────────────────────────

export const sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || "https://habit-tracker-roan-tau.vercel.app"}/reset-password?token=${token}`;
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

  return transporter.sendMail({
    from: `"HabitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - HabitFlow",
    html: getBaseTemplate(
      content,
      "Security matters. You're one step away from getting back on track."
    ),
  });
};

// ─────────────────────────────────────────────
// Unified habit notification (reminder + streak warning)
// ─────────────────────────────────────────────

export const sendHabitNotification = async (
  email,
  name,
  habits,
  atRiskHabits = []
) => {
  const isUrgent = atRiskHabits.length > 0;
  const brandColor = isUrgent ? "#f97316" : "#4f46e5";

  const habitsHtml = habits
    .map((h) => {
      const atRisk = atRiskHabits.find((ar) => ar.id === h.id);
      const badge = atRisk
        ? `<div style="display:inline-block;background-color:#fee2e2;color:#ef4444;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;text-transform:uppercase;margin-bottom:4px;">⚠️ AT RISK</div>`
        : `<div style="display:inline-block;background-color:#e0e7ff;color:#4338ca;font-size:11px;font-weight:800;padding:2px 8px;border-radius:20px;text-transform:uppercase;margin-bottom:4px;">KEEP IT UP</div>`;

      const riskMsg = atRisk
        ? `<div style="color:#ef4444;font-size:13px;font-weight:600;margin-top:4px;line-height:1.4;">
            ${atRisk.diffDays >= 4
          ? "LAST CHANCE: Streak resets tomorrow!"
          : `Streak at risk: Missing for ${atRisk.diffDays} days.`
        }
           </div>`
        : "";

      return `
      <div style="background-color:${atRisk ? "#fffaf0" : "#f9fafb"};border-radius:12px;padding:16px 20px;margin-bottom:12px;border:1px solid ${atRisk ? "#ffedd5" : "#f3f4f6"};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              ${badge}
              <div style="font-weight:700;color:#111827;font-size:16px;margin-bottom:2px;">${h.title}</div>
              <div style="color:${atRisk ? "#ea580c" : "#4b5563"};font-size:14px;font-weight:600;">🔥 ${h.streak || 0} day streak</div>
              ${riskMsg}
            </td>
            <td align="right" valign="top">
              <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${atRisk ? "#fdba74" : "#d1d5db"};margin-top:4px;"></div>
            </td>
          </tr>
        </table>
      </div>
    `;
    })
    .join("");

  const headerTitle = isUrgent ? "⚠️ Streak Warning" : "Daily Reminder";
  const subTitle = isUrgent
    ? `Hi <span style="color:${brandColor};font-weight:700;">${name || "there"}</span>, don't let your hard work go to waste!`
    : `Hi <span style="color:${brandColor};font-weight:700;">${name || "there"}</span>, consistency is your superpower.`;

  const content = `
    <h2 style="margin:0 0 10px 0;color:${brandColor};font-size:26px;font-weight:800;text-align:center;">${headerTitle}</h2>
    <p style="margin:0 0 25px 0;color:#4b5563;font-size:16px;text-align:center;">${subTitle}</p>
    <div style="margin-bottom:30px;">
        <p style="margin:0 0 15px 0;color:#111827;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-align:center;opacity:0.7;">Incomplete Habits Today</p>
        ${habitsHtml}
    </div>
    <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || "https://habit-tracker-roan-tau.vercel.app"}" style="display:inline-block;background-color:${brandColor};color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:18px 40px;border-radius:14px;box-shadow:0 6px 20px ${isUrgent ? "rgba(249,115,22,0.3)" : "rgba(79,70,229,0.25)"};">Complete My Habits</a>
    </div>
  `;

  const footerText = isUrgent
    ? "Consistency builds success. Don't let your progress slip."
    : "Small steps every day build powerful habits. Keep going!";

  return transporter.sendMail({
    from: `"HabitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${isUrgent ? "⚠️ Streak Warning" : "Daily Habit Reminder"} - HabitFlow`,
    html: getBaseTemplate(content, footerText),
  });
};

// ─────────────────────────────────────────────
// Welcome email
// ─────────────────────────────────────────────

export const sendWelcomeEmail = async (email, name) => {
  const brandColor = "#4f46e5";
  const content = `
    <h2 style="margin:0 0 15px 0;color:${brandColor};font-size:26px;font-weight:800;text-align:center;">Welcome to HabitFlow!</h2>
    <p style="margin:0 0 25px 0;color:#374151;font-size:16px;line-height:1.6;text-align:center;">
        Hi ${name || "there"}, we're thrilled to have you here! You're now equipped to track your habits, build streaks, and transform your daily life.
    </p>
    <div style="background-color:#f5f3ff;border-radius:12px;padding:25px;margin-bottom:30px;">
        <p style="margin:0 0 12px 0;color:#111827;font-weight:700;">Quick Tips to Get Started:</p>
        <div style="margin-bottom:8px;color:#4b5563;font-size:15px;">• Create your first habit</div>
        <div style="margin-bottom:8px;color:#4b5563;font-size:15px;">• Set a daily reminder time</div>
        <div style="color:#4b5563;font-size:15px;">• Check in daily to grow your streak</div>
    </div>
    <div style="text-align:center;">
        <a href="${process.env.CLIENT_URL || "https://habit-tracker-roan-tau.vercel.app"}" style="display:inline-block;background-color:${brandColor};color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 36px;border-radius:12px;">Start My Journey</a>
    </div>
  `;

  return transporter.sendMail({
    from: `"HabitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to HabitFlow 🚀",
    html: getBaseTemplate(
      content,
      "Your journey starts today. Build habits that shape your future."
    ),
  });
};

// ─────────────────────────────────────────────
// Weekly report
// ─────────────────────────────────────────────

export const sendWeeklyReport = async (email, name, habits, stats) => {
  const brandColor = "#4f46e5";
  const {
    weekStart,
    weekEnd,
    totalCompleted,
    totalPossible,
    completionRate,
    daysElapsed,
  } = stats;

  // Colour the completion rate
  const rateColor =
    completionRate >= 80
      ? "#16a34a"
      : completionRate >= 50
        ? "#f59e0b"
        : "#ef4444";

  const rateEmoji =
    completionRate >= 80 ? "🏆" : completionRate >= 50 ? "💪" : "😅";

  // Habit rows
  const habitsHtml = habits
    .map((h) => {
      const completions = parseInt(h.completions_this_week, 10);
      const rate =
        daysElapsed > 0 ? Math.round((completions / daysElapsed) * 100) : 0;
      const barWidth = Math.max(rate, 4); // minimum 4% so bar is always visible
      const barColor = rate >= 80 ? "#4f46e5" : rate >= 50 ? "#f59e0b" : "#ef4444";

      return `
      <div style="background-color:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:10px;border:1px solid #f3f4f6;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-weight:700;color:#111827;font-size:15px;margin-bottom:2px;">${h.title}</div>
              <div style="color:#6b7280;font-size:13px;">🔥 ${h.streak || 0} day streak &nbsp;·&nbsp; ${completions}/${daysElapsed} days done</div>
            </td>
            <td align="right" valign="middle" style="width:50px;">
              <span style="font-weight:800;color:${barColor};font-size:15px;">${rate}%</span>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding-top:8px;">
              <!-- Progress bar -->
              <div style="background-color:#e5e7eb;border-radius:99px;height:6px;overflow:hidden;">
                <div style="background-color:${barColor};width:${barWidth}%;height:6px;border-radius:99px;"></div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
    })
    .join("");

  const content = `
    <h2 style="margin:0 0 6px 0;color:${brandColor};font-size:26px;font-weight:800;text-align:center;">📊 Your Weekly Report</h2>
    <p style="margin:0 0 6px 0;color:#6b7280;font-size:14px;text-align:center;">${weekStart} → ${weekEnd}</p>
    <p style="margin:0 0 28px 0;color:#4b5563;font-size:16px;text-align:center;">
      Hi <span style="color:${brandColor};font-weight:700;">${name || "there"}</span>, here's how you did this week!
    </p>

    <!-- Big stat -->
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);background-color:#4f46e5;border-radius:16px;padding:28px;margin-bottom:28px;text-align:center;">
      <div style="color:rgba(255,255,255,0.75);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Overall Completion</div>
      <div style="color:#ffffff;font-size:56px;font-weight:900;line-height:1;">${rateEmoji} ${completionRate}%</div>
      <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-top:8px;">${totalCompleted} of ${totalPossible} habit check-ins completed</div>
    </div>

    <!-- Per-habit breakdown -->
    <p style="margin:0 0 14px 0;color:#111827;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;text-align:center;opacity:0.7;">Habit Breakdown</p>
    ${habitsHtml}

    <div style="text-align:center;margin-top:30px;">
      <a href="${process.env.CLIENT_URL || "https://habit-tracker-roan-tau.vercel.app"}" style="display:inline-block;background-color:${brandColor};color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:18px 40px;border-radius:14px;box-shadow:0 6px 20px rgba(79,70,229,0.25);">View My Dashboard</a>
    </div>
  `;

  return transporter.sendMail({
    from: `"HabitFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📊 Your Weekly Habit Report - HabitFlow`,
    html: getBaseTemplate(
      content,
      "Every week is a fresh start. Keep building those habits!"
    ),
  });
};

// ─────────────────────────────────────────────
// Named convenience wrappers (used by cronService)
// ─────────────────────────────────────────────

export const sendDailyReminder = (email, name, habits) =>
  sendHabitNotification(email, name, habits, []);

export const sendStreakWarning = (email, name, habits) =>
  sendHabitNotification(email, name, habits, habits);
