const twilio = require("twilio");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

function normalizePhoneToE164(phone) {
  if (!phone) return null;

  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  if (digits.length > 10) {
    return `+${digits}`;
  }

  return `+${digits}`;
}

/**
 * Sends a transactional SMS via Twilio.
 *
 * Uses either a Twilio Messaging Service SID or a sender phone number.
 */
async function sendSms(phone, message) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn("[sms.service] Twilio credentials missing — skipping SMS send:", message);
    return { status: "skipped" };
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const to = normalizePhoneToE164(phone);

  if (!to) {
    console.warn("[sms.service] Invalid phone number provided — skipping SMS send:", phone);
    return { status: "failed", error: "invalid_phone" };
  }

  try {
    const payload = {
      body: message,
      to,
    };

    if (TWILIO_MESSAGING_SERVICE_SID) {
      payload.messagingServiceSid = TWILIO_MESSAGING_SERVICE_SID;
    } else if (TWILIO_PHONE_NUMBER) {
      payload.from = TWILIO_PHONE_NUMBER;
    }

    const res = await client.messages.create(payload);
    return { status: "sent", providerResponse: res.sid, to };
  } catch (err) {
    console.error("[sms.service] Twilio send failed:", err.message);
    return { status: "failed", error: err.message, to };
  }
}

module.exports = { sendSms };