const express = require("express");
const multer = require("multer");
const { uploadFile } = require("../Controllers/upload.controller");
const authenticateUser = require("../Middlewares/auth.middleware");

const router = express.Router();

// Memory storage keeps file buffers in RAM
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Protect route to verify token, upload single file with field name 'file'
router.post("/", authenticateUser, upload.single("file"), uploadFile);

module.exports = router;