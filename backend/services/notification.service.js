const Notification = require("../Models/Notification.model");
const User = require("../Models/userModel.model");
const SystemSetting = require("../Models/systemSetting.model");
const { sendSms } = require("./sms.service");

/**
 * Central place to notify a user whenever an admin acts on something of theirs
 * (document decision, claim status change, support reply/resolve, KYC review).
 *
 * Creates an in-app Notification doc AND best-effort sends an SMS.
 * SMS failure is caught internally and never throws — a bad phone number or a
 * down SMS provider should never block or fail the admin's action.
 *
 * @param {Object} params
 * @param {String} params.userId      - the end-user's Mongo _id
 * @param {"document"|"claim"|"support"|"system"} params.type
 * @param {String} params.title       - short title shown in the notification list
 * @param {String} params.body        - full text for the in-app notification
 * @param {String} [params.smsText]   - shorter text for SMS (falls back to body, must fit DLT template)
 * @param {Object} [params.meta]      - e.g. { documentId, claimId, ticketId, status }
 */
async function notifyUser({ userId, type, title, body, smsText, meta = {} }) {
  if (!userId) return null;

  const notification = await Notification.create({
    user: userId,
    type,
    title,
    body,
    meta,
  });

  try {
    const [user, settings] = await Promise.all([
      User.findById(userId).select("phone fullName"),
      SystemSetting.findOne().sort({ createdAt: -1 }),
    ]);

    if (!user?.phone) {
      notification.smsStatus = "skipped";
      await notification.save();
      return notification;
    }

    const smsEnabled = settings?.notifications?.smsEnabled !== false;
    if (!smsEnabled) {
      notification.smsStatus = "skipped";
      await notification.save();
      return notification;
    }

    const text = (smsText || body).slice(0, 160); // keep to one SMS segment
    const result = await sendSms(user.phone, text);
    notification.smsStatus = result.status === "sent" ? "sent" : result.status;
    await notification.save();
  } catch (err) {
    console.error("[notification.service] SMS step failed:", err.message);
    notification.smsStatus = "failed";
    await notification.save();
  }

  return notification;
}

module.exports = { notifyUser };