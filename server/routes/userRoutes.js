import express from "express";
import { updateProfile, updateNotifications, changePassword, getUserSettings } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/settings", authenticateToken, getUserSettings);
router.put("/profile", authenticateToken, updateProfile);
router.put("/notifications", authenticateToken, updateNotifications);
router.put("/change-password", authenticateToken, changePassword);

export default router;
