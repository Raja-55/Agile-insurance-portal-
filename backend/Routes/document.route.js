// src/Routes/document.routes.js  (full replacement)
const express = require("express");
const router = express.Router();
const authenticateUser = require("../Middlewares/auth.middleware");
const upload = require("../Middlewares/upload.middleware");
const {
  uploadDocument,
  getUserDocuments,
  getUserDocumentFile,
  deleteDocument,
} = require("../Controllers/document.controller");

router.post("/upload", authenticateUser, upload.single("file"), uploadDocument);
router.get("/", authenticateUser, getUserDocuments);
router.get("/:id/file", authenticateUser, getUserDocumentFile);
router.delete("/:id", authenticateUser, deleteDocument);

module.exports = router;