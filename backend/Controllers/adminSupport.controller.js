const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const SupportTicket = require("../Models/contact.model");

const replySupportTicket = catchAsync(async(req,res)=>{
    console.log("Ticket ID:", req.params.id);
  console.log("Body:", req.body);
  console.log("Admin:", req.admin);
  const {id} = req.params;
  const {message} =req.body;

  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    return res.status(404).json({
      success: false,
      message: "Support ticket not found.",
    });
  }

  ticket.messages.push({
  sender: req.admin._id,
  senderRole: "admin",
  text: message
});

  await ticket.save();
  res.json({
    success: true,
    data:ticket
  });
  
})

const getAllSupportTickets = catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find()
    .populate("user", "fullName firstName username email phone")  // add all name fields
    .sort({ updatedAt: -1 });
    
    console.log("RAW user field:", JSON.stringify(tickets[0]?.user));
  const data = tickets.map((t) => ({
    id: t._id,
    userId: t.user?._id,
    // Try all possible name fields:
    userName: t.user?.fullName || t.user?.firstName || t.user?.username || t.user?.name || "Unknown user",
    userEmail: t.user?.email,
    userPhone: t.user?.phone || t.user?.phoneNumber,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    assignedAdmin: t.assignedAdmin,
    messages: t.messages,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));
  // In getAllSupportTickets, before the map:
  res.json({ success: true, data });
});

const resolveTicket = catchAsync(async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
  res.json({ success: true, data: ticket });
});




module.exports = {
  replySupportTicket,
  getAllSupportTickets,
  resolveTicket,
};

