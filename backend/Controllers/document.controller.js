// src/Controllers/document.controller.js  (full replacement)
const Document = require("../Models/document.model");

// POST /api/documents/upload
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const document = await Document.create({
      user: req.user._id,
      documentType: req.body.documentType,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/documents/
const getUserDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/documents/:id/file  — lets user preview their own uploaded file
const getUserDocumentFile = async (req, res) => {
  const path = require("path");
  const fs = require("fs");
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

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

// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
  const path = require("path");
  const fs = require("fs");
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    // Delete file from disk
    const absolutePath = path.resolve(doc.filePath);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);

    await doc.deleteOne();
    res.json({ success: true, message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { uploadDocument, getUserDocuments, getUserDocumentFile, deleteDocument };