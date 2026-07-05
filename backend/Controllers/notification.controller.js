const Notification = require("../Models/Notification.model");
const catchAsync = require("../Utils/catchAsync");
const { sendSms } = require("../services/sms.service");

// GET /api/notifications/my
const getMyNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.status(200).json({ success: true, data: notifications });
});

// PATCH /api/notifications/:id/read
const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }
  res.status(200).json({ success: true, data: notification });
});

// PATCH /api/notifications/read-all
const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.status(200).json({ success: true });
});

// POST /api/notifications/test-sms
const testSms = catchAsync(async (req, res) => {
  const { phone, message } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  const result = await sendSms(phone, message || "Agile Insurance test SMS from your backend.");

  res.status(200).json({ success: true, data: result });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead, testSms };