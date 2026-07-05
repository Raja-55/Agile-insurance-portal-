const express = require("express");
const router = express.Router();

// Your admin routes clearly already have user-auth middleware elsewhere
// (req.user._id is used in createAuditLog / replyToSupportTicket in admin.controller.js).
// Import that same middleware here — adjust the path/name to match your actual file.
const authenticateUser = require("../Middlewares/auth.middleware");

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  testSms,
} = require("../Controllers/notification.controller");

router.get("/my", authenticateUser, getMyNotifications);
router.patch("/:id/read", authenticateUser, markAsRead);
router.patch("/read-all", authenticateUser, markAllAsRead);
router.post("/test-sms", authenticateUser, testSms);

module.exports = router;

/**
 * In your main routes index / app.js, register with:
 *   const notificationRoutes = require("./Routes/notification.routes");
 *   app.use("/api/notifications", notificationRoutes);
 */