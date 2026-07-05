const mongoose = require("mongoose");

const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const isPhone = (value) => /^[0-9]{10,15}$/.test(String(value || "").trim());

const isObjectId = (value) => mongoose.isValidObjectId(value);

const validateRegisterBody = (body) => {
  const errors = [];
  if (!body.fullName?.trim()) errors.push("fullName is required");
  if (!isEmail(body.email)) errors.push("email must be valid");
  if (!isPhone(body.phone)) errors.push("phone must be valid");
  if (!body.password || String(body.password).trim().length < 4) {
    errors.push("password must be at least 4 characters");
  }
  if (body.gender && !["male", "female", "other"].includes(body.gender)) errors.push("gender is invalid");
  if (body.role && !["user", "admin"].includes(body.role)) errors.push("role is invalid");
  return errors;
};

const validateLoginBody = (body) => {
  const errors = [];
  if (!isEmail(body.email)) errors.push("email must be valid");
  if (!body.password) errors.push("password is required");
  return errors;
};

const validateUpdateProfileBody = (body) => {
  const errors = [];
  if (body.email && !isEmail(body.email)) errors.push("email must be valid");
  if (body.phone && !isPhone(body.phone)) errors.push("phone must be valid");
  if (body.gender && !["male", "female", "other"].includes(body.gender)) errors.push("gender is invalid");
  if (body.role && !["user", "admin"].includes(body.role)) errors.push("role is invalid");
  return errors;
};

const validateChangePasswordBody = (body) => {
  const errors = [];
  if (!body.current_password) errors.push("current_password is required");
  if (!body.new_password || String(body.new_password).trim().length < 4) {
    errors.push("new_password must be at least 4 characters");
  }
  return errors;
};

const validateKycBody = (body) => {
  const errors = [];
  if (!body.document_type || !["aadhaar", "pan", "passport", "driving_license"].includes(body.document_type)) {
    errors.push("document_type is invalid");
  }
  if (!body.document_number?.trim()) errors.push("document_number is required");
  if (!body.document_image?.trim()) errors.push("document_image is required");
  return errors;
};

module.exports = {
  validateRegisterBody,
  validateLoginBody,
  validateUpdateProfileBody,
  validateChangePasswordBody,
  validateKycBody,
};
