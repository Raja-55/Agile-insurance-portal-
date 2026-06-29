const User = require("../Models/userModel.model");
const Policy = require("../Models/policy.model");
const Claim = require("../Models/claim.model");
const Payment = require("../Models/payment.model");
const KycRequest = require("../Models/kycRequest.model");
const SystemSetting = require("../Models/systemSetting.model");
const AuditLog = require("../Models/auditlog.model");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");
const Admin = require("../Models/admin.model");


const Document = require("../Models/document.model");
const path = require("path");
const fs = require("fs");


const flattenObject = (obj, prefix = "") => {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix ? prefix + "." : "";
    if (obj[key] !== null && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], pre + key));
    } else {
      acc[pre + key] = obj[key];
    }
    return acc;
  }, {});
};

const getDashboard = catchAsync(async (req, res) => {

  const [totalUsers, activePolicies, pendingClaims, revenueAgg, pendingKyc] = await Promise.all([
    User.countDocuments({ role: "user" }),
    // User.countDocuments({ role: "agent" }),
    Policy.countDocuments({ status: "active" }),
    Claim.countDocuments({ status: "pending" }),
    Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    KycRequest.countDocuments({ status: "pending" }),
  ]);
  const recentUsers = await User.find().select("fullName email role created_at kyc_status").sort({ created_at: -1 }).limit(8);

  const recentClaims = await Claim.find()
    .populate("user", "fullName email")
    .populate("policy", "policyName category")
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(200).json({
    success: true,
    data: {
      widgets: {
        totalUsers,
        totalAgents,
        activePolicies,
        pendingClaims,
        totalRevenue: revenueAgg?.[0]?.total || 0,
        pendingKycRequests: pendingKyc,
      },
      recentUsers,
      recentClaims,
    },
  });
});


const getUsers = catchAsync(async (req, res) => {
  try{
    const users = await User.find()
    .select(
      "_id fullName email phone address is_verified created_at"
    );
    const formattedUsers = users.map((user) => ({
      id: user._id,
      name: user.fullName,
      email:user.email,
      phone: user.phone,
      address: user.address,
      status: user.is_verified? "Active": "Inactive",
      joinedAt:user.created_at,
    }));
    res.status(200).json({
      success: true,
      data: formattedUsers,
    });

  }
  catch(error){
    res.status(500).json({
      sucess: false,
      message: error.message
    });
  }
});



const createUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, address, status } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  const existing = await User.findOne({ $or: [{ email }, ...(phone ? [{ phone }] : [])] });
  if (existing) {
    return next(new AppError("Email or phone already exists", 409));
  }
  const user = await User.create({
    fullName: name || "New Customer",
    email,
    phone: phone || `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    address: address || "",
    is_verified: status === "Active",
    kyc_status: "pending",
    password: "User@123",
    role: "user"
  });
  res.status(201).json({ success: true, data: user });
});



const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, phone, address, status } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (email && email !== user.email) {
    const existing = await User.findOne({ email });
    if (existing) return next(new AppError("Email already exists", 409));
    user.email = email;
  }

  if (phone && phone !== user.phone) {
    const existing = await User.findOne({ phone });
    if (existing) return next(new AppError("Phone already exists", 409));
    user.phone = phone;
  }

  if (name) user.fullName = name;
  if (address !== undefined) user.address = address;
  if (status !== undefined) user.is_verified = (status === "Active");

  await user.save();
  res.status(200).json({ success: true, data: user });
});



const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.status(200).json({ success: true, message: "User deleted successfully" });
});

const getPolicies = catchAsync(async (req, res) => {
  const policies = await Policy.find().populate("admin", "fullName email role").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: policies });
});























const getClaims = catchAsync(async (req, res, next) => {
  const claims = await Claim.find()
    .populate("user", "fullName email phone")
    .populate("policy", "policyName category companyName")
    .populate("purchase", "purchase_number")
    .sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: claims.length,
    data: claims,
  });
});

const updateClaim = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;
  const updateFields = {};
  if (status) {
    updateFields.claim_status = status;
    updateFields.status = status === "submitted" ? "pending" : status;
    updateFields.reviewed_at = new Date();
  }
  if (notes !== undefined) {
    updateFields.admin_review = notes;
    updateFields.notes = notes;
  }

  const claim = await Claim.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true }
  )
    .populate("user", "fullName email")
    .populate("policy", "policyName category");

  if (!claim) return next(new AppError("Claim not found", 404));

  res.status(200).json({ success: true, data: claim });
});

const deleteClaim = catchAsync(async (req, res, next) => {
  const claim = await Claim.findByIdAndDelete(req.params.id);
  if (!claim) return next(new AppError("Claim not found", 404));
  res.status(200).json({ success: true, message: "Claim deleted successfully" });
});




















const getPayments = catchAsync(async (req, res) => {
  const payments = await Payment.find().populate("user", "fullName email phone role").populate("policy").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: payments });
});

const getKycRequests = catchAsync(async (req, res) => {
  const requests = await KycRequest.find().populate("user", "fullName email phone role kyc_status").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: requests });
});

const getSystemSettings = catchAsync(async (req, res) => {
  let settings = await SystemSetting.findOne().sort({ createdAt: -1 });

  if (!settings) {
    settings = await SystemSetting.create({});
  }

  res.status(200).json({ success: true, data: settings });
});

const updateSystemSettings = catchAsync(async (req, res) => {
  const flattened = flattenObject(req.body);
  const settings = await SystemSetting.findOneAndUpdate(
    {},
    { $set: flattened },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );

  res.status(200).json({ success: true, message: "Admin settings updated", data: settings });
});

const createAuditLog = catchAsync(async (req, res, next) => {
  const { action, module = "admin", description = "" } = req.body;

  if (!action || !String(action).trim()) {
    return next(new AppError("Action is required", 400));
  }

  const log = await AuditLog.create({
    admin: req.user._id,
    action: String(action).trim(),
    module: String(module || "admin").trim(),
    description: String(description || action).trim(),
    ipAddress: req.ip || "",
  });

  const populatedLog = await AuditLog.findById(log._id).populate("admin", "fullName email role");

  res.status(201).json({ success: true, message: "Audit log saved", data: populatedLog });
});

const getAuditLogs = catchAsync(async (req, res) => {
  const logs = await AuditLog.find()
    .populate("admin", "fullName email role")
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({ success: true, data: logs });
});

const reviewKyc = catchAsync(async (req, res, next) => {
  const { status, review_note } = req.body;
  if (!["verified", "rejected", "pending"].includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const requestDoc = await KycRequest.findById(req.params.id);
  if (!requestDoc) {
    return next(new AppError("KYC request not found", 404));
  }

  requestDoc.status = status;
  requestDoc.review_note = review_note || "";
  requestDoc.reviewed_by = req.user._id;
  await requestDoc.save();

  await User.findByIdAndUpdate(requestDoc.user, {
    kyc_status: status,
    is_verified: status === "verified",
  });

  res.status(200).json({
    success: true,
    message: "KYC request updated",
    data: requestDoc,
  });
});


const getSupportTicketsAdmin = catchAsync(async (req, res) => {
  const SupportTicket = require("../Models/contact.model");

  const tickets = await SupportTicket.find()
    .populate("user", "fullName email phone")
    .populate("assignedAdmin", "fullName email")
    .sort({ createdAt: -1 });

  const formattedTickets = tickets.map((ticket) => {
    const user = ticket.user || {};
    const assignedAdmin = ticket.assignedAdmin || null;

    return {
      id: ticket._id,
      userId: user._id || null,
      userName: user.full_name || "Unknown user",
      userEmail: user.email || "",
      userPhone: user.phone || "",
      subject: ticket.subject || "Support ticket",
      status: ticket.status || "Open",
      priority: ticket.priority || "Medium",
      assignedAdmin: assignedAdmin
        ? {
            _id: assignedAdmin._id || null,
            full_name: assignedAdmin.full_name || assignedAdmin.name || "Unassigned",
            email: assignedAdmin.email || "",
          }
        : null,
      messages: Array.isArray(ticket.messages) ? ticket.messages : [],
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  });

  res.status(200).json({
    success: true,
    data: formattedTickets,
  });
});

const updateSupportTicket = catchAsync(async (req, res, next) => {
  const SupportTicket = require("../Models/contact.model");
  const { status, priority, assignedAdmin } = req.body;

  const validStatuses = ["Open", "In Progress", "Resolved"];
  if (status && !validStatuses.includes(status)) {
    return next(new AppError("Invalid status", 400));
  }

  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { status, priority, assignedAdmin },
    { new: true }
  ).populate("user", "full_name email").populate("assignedAdmin", "full_name email");

  if (!ticket) {
    return next(new AppError("Support ticket not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Support ticket updated",
    data: ticket,
  });
});

const replyToSupportTicket = catchAsync(async (req, res, next) => {
  const SupportTicket = require("../Models/contact.model");
  const { text } = req.body;

  if (!text || !String(text).trim()) {
    return next(new AppError("Message text is required", 400));
  }

  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) {
    return next(new AppError("Support ticket not found", 404));
  }

  ticket.messages.push({
    sender: req.user._id,
    senderRole: "admin",
    text: String(text).trim(),
    createdAt: new Date(),
  });

  await ticket.save();

  const updatedTicket = await SupportTicket.findById(ticket._id)
     .populate("user", "fullName email phone")
    .populate("assignedAdmin", "fullName email")
    .populate("messages.sender", "fullName email");

  res.status(200).json({
    success: true,
    message: "Reply added successfully",
    data: updatedTicket,
  });
});

const getAdminProfile = catchAsync(async(req, res) => {
  try{
    const admin = await Admin.findById(req.admin.id)
    .select("-password");

    res.json({
      success: true,
      data: admin
    });
  }
  catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

const updateAdminProfile = catchAsync(async (req, res, next) => {
    const { fullName, phone, email, profilePhoto } = req.body;

    const existing = await Admin.findOne({
        _id: { $ne: req.admin._id },
        $or: [{ email }, { phone }]
    });

    if (existing) {
        return next(new AppError("Email or phone already exists.", 400));
    }

    const admin = await Admin.findByIdAndUpdate(
        req.admin._id,
        {
            fullName,
            email,
            phone,
            profilePhoto,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-password");

    res.json({
        success: true,
        data: admin,
    });
});

const changeAdminPassword = catchAsync(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin.id);

    const isMatch = await admin.comparePassword(oldPassword);

    if (!isMatch) {
        return res.status(400).json({
            message: "Old password incorrect"
        });
    }

    admin.password = newPassword;

    await admin.save();

    res.json({
        success: true,
        message: "Password updated"
    });

});




// GET /api/admin/documents
// Returns all documents with populated user info
const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find()
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    const formatted = docs.map((doc) => ({
      id: doc._id,
      type: doc.documentType,
      fileName: doc.fileName,
      filePath: doc.filePath,
      mimeType: doc.mimeType,
      size: doc.size,
      status: doc.status,
      note: doc.note,
      owner: doc.user?.fullName || doc.user?.email || "Unknown",
      ownerEmail: doc.user?.email,
      userId: doc.user?._id,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/documents/:id/approve
const approveDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "Approved", note: req.body.note || "" },
      { new: true }
    ).populate("user", "fullName email");

    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    res.json({ success: true, message: "Document approved", data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/documents/:id/reject
const rejectDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected", note: req.body.note || "Document rejected by admin." },
      { new: true }
    ).populate("user", "fullName email");

    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    res.json({ success: true, message: "Document rejected", data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/documents/:id/correction
// Admin sends correction note (with optional markup JSON)
const sendDocumentCorrection = async (req, res) => {
  try {
    const { note, marks } = req.body;

    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      {
        status: "Re-upload Requested",
        note: note || "Admin has requested corrections. Please re-upload.",
        ...(marks && { marks }), // if you later add a marks field to schema
      },
      { new: true }
    ).populate("user", "fullName email");

    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    res.json({ success: true, message: "Correction sent", data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/documents/:id/file
// Streams the actual file back to admin for preview
const getDocumentFile = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    const absolutePath = path.resolve(doc.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: "File not found on disk" });
    }

    res.setHeader("Content-Type", doc.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${doc.fileName}"`);
    fs.createReadStream(absolutePath).pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};








module.exports = {
  getDashboard,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  // getAgents,
  getPolicies,
  getClaims,
  getPayments,
  getKycRequests,
  getSystemSettings,
  updateSystemSettings,
  createAuditLog,
  getAuditLogs,
  reviewKyc,
  updateClaim,
  deleteClaim,
  getSupportTicketsAdmin,
  updateSupportTicket,
  replyToSupportTicket,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  
  getDocuments,
  approveDocument,
  rejectDocument,
  sendDocumentCorrection,
  getDocumentFile,
};
