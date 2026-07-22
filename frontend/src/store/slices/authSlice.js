// src/store/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const defaultAdminProfiles = [
  {
    adminId: "ADM-SUPER-001",
    email: "asha.admin@agileinsure.in",
    password: "Super@123",
    profilePhoto: "",
    name: "Asha Menon",
    role: "Super Admin",
    initials: "AM",
    access: "Full platform access",
  },
  {
    adminId: "ADM-MGR-002",
    email: "rohit.manager@agileinsure.in",
    password: "Manager@123",
    profilePhoto: "",
    name: "Rohit Kapoor",
    role: "Insurance Manager",
    initials: "RK",
    access: "Policies, users, requirements",
  },
  {
    adminId: "ADM-CLM-003",
    email: "naina.claims@agileinsure.in",
    password: "Claims@123",
    profilePhoto: "",
    name: "Naina Shah",
    role: "Claims Officer",
    initials: "NS",
    access: "Claims and document review",
  },
  {
    adminId: "ADM-SUP-004",
    email: "imran.support@agileinsure.in",
    password: "Support@123",
    profilePhoto: "",
    name: "Imran Ali",
    role: "Support Executive",
    initials: "IA",
    access: "Tickets and user replies",
  },
];

const STORAGE_ADMINS = "agile_insurance_admins_v1";
const STORAGE_TOKEN = "agile_insurance_admin_token";
const STORAGE_PROFILE = "agile_insurance_admin_profile";

const loadAdmins = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_ADMINS));
    return Array.isArray(saved) && saved.length ? saved : defaultAdminProfiles;
  } catch {
    return defaultAdminProfiles;
  }
};

const token = localStorage.getItem(STORAGE_TOKEN);

const profile = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PROFILE));
  } catch {
    return null;
  }
})();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isAuthenticated: !!token,
    token,
    adminProfiles: loadAdmins(),
    selectedProfile: profile || loadAdmins()[0],
  },

  reducers: {
    loginSuccess(state, action) {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.selectedProfile = action.payload.profile;

      localStorage.setItem(STORAGE_TOKEN, action.payload.token);
      localStorage.setItem(
        STORAGE_PROFILE,
        JSON.stringify(action.payload.profile)
      );
    },

    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.selectedProfile = state.adminProfiles[0];
<<<<<<< HEAD
      // Clear both the v1 keys used by api.js and any legacy keys
      localStorage.removeItem("agile_insurance_admin_token_v1");
      localStorage.removeItem("agile_insurance_admin_profile_v1");
      localStorage.removeItem("agile_insurance_admin_token");
      localStorage.removeItem("agile_insurance_admin_profile");
=======

      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_PROFILE);
>>>>>>> raj
    },

    setSelectedProfile(state, action) {
      state.selectedProfile = action.payload;
      localStorage.setItem(
        STORAGE_PROFILE,
        JSON.stringify(action.payload)
      );
    },

    updateProfile(state, action) {
      const changes = action.payload;

      state.selectedProfile = {
        ...state.selectedProfile,
        ...changes,
      };

      state.adminProfiles = state.adminProfiles.map((admin) =>
        admin.email === state.selectedProfile.email
          ? { ...admin, ...changes }
          : admin
      );

      localStorage.setItem(
        STORAGE_ADMINS,
        JSON.stringify(state.adminProfiles)
      );

      localStorage.setItem(
        STORAGE_PROFILE,
        JSON.stringify(state.selectedProfile)
      );
    },

    setAdminProfiles(state, action) {
      state.adminProfiles = action.payload;

      localStorage.setItem(
        STORAGE_ADMINS,
        JSON.stringify(action.payload)
      );
    },
  },
});

export const {
  loginSuccess,
  logout,
  setSelectedProfile,
  updateProfile,
  setAdminProfiles,
} = authSlice.actions;

export default authSlice.reducer;