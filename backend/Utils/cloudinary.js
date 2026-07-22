const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "demo",
  api_key:    process.env.CLOUDINARY_API_KEY    || "default",
  api_secret: process.env.CLOUDINARY_API_SECRET || "default",
});

/**
 * Uploads a file to Cloudinary.
 * Supports a local file path, a buffer, or a base64 string/data URL.
 */
const uploadToCloudinary = async (fileSource, options = {}) => {
  try {
    // If not configured, return a mock URL for testing
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME === "demo"
    ) {
      console.warn("Cloudinary not fully configured in env. Using fallback mock upload URL.");
      return {
        secure_url: `https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg`,
        public_id: "sample_id",
      };
    }

    const result = await cloudinary.uploader.upload(fileSource, {
      resource_type: "auto", // Automatically detect PDF, JPG, PNG, DOCX, etc.
      ...options,
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};