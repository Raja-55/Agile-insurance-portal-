const express = require("express");
const authenticateUser = require("../Middlewares/auth.middleware");
const {
  getProfile,
  updateProfile,
  addFamilyMember,
  removeFamilyMember,
} = require("../Controllers/userProfile.controller");

const router = express.Router();

router.use(authenticateUser);

router.get("/me", getProfile);
router.put("/me", updateProfile);
router.post("/family", addFamilyMember);
router.delete("/family/:memberId", removeFamilyMember);

module.exports = router;