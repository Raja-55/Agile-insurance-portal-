const nodemailer = require("nodemailer");

let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
} else {
    // Development fallback: use JSON transport so sendMail succeeds but doesn't send real email.
    // This prevents registration from failing during local development when SMTP creds are not set.
    console.warn("EMAIL_USER/EMAIL_PASS not set — using JSON transport (dev fallback)");
    transporter = nodemailer.createTransport({ jsonTransport: true });
}

// try {
//   const info = await transporter.sendMail({
//     from: '"KShtrapati" <kshala@gmail.com>', // sender address
//     to: "", // list of recipients
//     subject: "Hello", // subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // HTML body
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Preview URL is only available when using an Ethereal test account
//   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// } catch (err) {
//   console.error("Error while sending mail:", err);
// }

module.exports = {
    transporter,
};