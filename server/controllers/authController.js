import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pkg from "pg";
import { sendResetEmail, sendWelcomeEmail } from "../services/emailService.js";

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (password.length < 3) {
    return res.status(400).json({ error: "Password must be at least 3 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hashedPassword, name || email.split('@')[0]]
    );
    res.status(201).json(result.rows[0]);

    // Send welcome email with a slight delay (non-blocking)
    setTimeout(async () => {
      try {
        await sendWelcomeEmail(email, result.rows[0].name);
      } catch (error) {
        console.error("Error sending welcome email:", error);
      }
    }, 1000);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    // Always return same response to prevent email enumeration
    if (!user) {
      return res.json({ message: "If an account with that email exists, we sent a reset link." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    
    // Hash token for storage
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    
    // Set expiry (1 hour)
    const expiry = new Date(Date.now() + 3600000);

    // Save to DB
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [hashedToken, expiry, user.id]
    );

    // Send email (raw token)
    await sendResetEmail(email, token);

    res.json({ message: "If an account with that email exists, we sent a reset link." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!newPassword || newPassword.length < 3) {
    return res.status(400).json({ error: "Password must be at least 3 characters long." });
  }

  try {
    // Hash incoming token to match stored version
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid user
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [hashedToken]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user and clear token
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successful. You can now log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};
