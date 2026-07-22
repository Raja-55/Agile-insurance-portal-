const { uploadToCloudinary } = require("../Utils/cloudinary");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    // Convert buffer to base64 data URL
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    
    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(dataURI, {
      folder: "agile_insurance_portal",
    });

    res.status(200).json({
      success: true,
      message: "File uploaded successfully to Cloudinary.",
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload file.",
    });
  }
};

module.exports = {
  uploadFile,
};