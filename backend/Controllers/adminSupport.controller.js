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
module.exports = {
  replySupportTicket
};

