const SupportTicket = require("../Models/contact.model");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");

const createSupportTicket = catchAsync(async (req, res, next) => {
  const { subject, message, priority = "Medium" } = req.body;

  if (!subject || !message || !String(message).trim()) {
    return next(new AppError("Subject and message are required.", 400));
  }

  const ticket = await SupportTicket.create({
    user: req.user._id,
    subject,
    priority,
    status: "Open",
    messages: [
      {
        sender: req.user._id,
        senderRole: "user",
        text: String(message).trim(),
        createdAt: new Date(),
      },
    ],
  });

  const ticketWithUser = await SupportTicket.findById(ticket._id)
    .populate("user", "full_name email")
    .populate("assignedAdmin", "full_name email");

  res.status(201).json({
    success: true,
    message: "Support ticket created successfully.",
    data: ticketWithUser,
  });
});

const getSupportTickets = catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate("user", "full_name email")
    .populate("assignedAdmin", "full_name email");

  res.status(200).json({
    success: true,
    data: tickets,
  });
});

module.exports = {
  createSupportTicket,
  getSupportTickets,
};
