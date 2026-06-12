const User = require("../Models/userModel.model");
const UserProfile = require("../Models/userProfile.model");
const catchAsync = require("../Utils/catchAsync");
const AppError = require("../Utils/appError");

const ensureProfile = async (userId) => {
  let profile = await UserProfile.findOne({ user: userId });

  if (!profile) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new AppError("User not found.", 404);
    }

    profile = await UserProfile.create({
      user: userId,
      full_name: user.full_name || user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      profile_photo: user.profile_image || user.profilePhoto || "",
      familyMembers: [],
      nominee: {
        name: "",
        relation: "Other",
        percentage: 100,
      },
    });
  }

  return profile;
};

const getProfile = catchAsync(async (req, res) => {
  const profile = await ensureProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: profile,
  });
});

const updateProfile = catchAsync(async (req, res, next) => {
  const { full_name, email, phone, address, profile_photo, nominee } = req.body;

  const profile = await ensureProfile(req.user._id);

  if (full_name !== undefined) profile.full_name = full_name;
  if (email !== undefined) profile.email = email;
  if (phone !== undefined) profile.phone = phone;
  if (address !== undefined) profile.address = address;
  if (profile_photo !== undefined) profile.profile_photo = profile_photo;
  if (nominee !== undefined) profile.nominee = { ...profile.nominee, ...nominee };

  await profile.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully.",
    data: profile,
  });
});

const addFamilyMember = catchAsync(async (req, res, next) => {
  const { name, relation, dateOfBirth, phone, notes, isNominee } = req.body;

  if (!name || !String(name).trim()) {
    return next(new AppError("Family member name is required.", 400));
  }

  const profile = await ensureProfile(req.user._id);

  profile.familyMembers.unshift({
    name: String(name).trim(),
    relation: relation || "Other",
    dateOfBirth: dateOfBirth || null,
    phone: phone || "",
    notes: notes || "",
    isNominee: Boolean(isNominee),
  });

  await profile.save();

  res.status(201).json({
    success: true,
    message: "Family member added successfully.",
    data: profile,
  });
});

const removeFamilyMember = catchAsync(async (req, res) => {
  const { memberId } = req.params;

  const profile = await ensureProfile(req.user._id);
  profile.familyMembers = profile.familyMembers.filter((member) => String(member._id) !== String(memberId));

  await profile.save();

  res.status(200).json({
    success: true,
    message: "Family member removed successfully.",
    data: profile,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  addFamilyMember,
  removeFamilyMember,
};
