import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContextInstance";
import { apiRequest, getToken, setToken } from "../utils/api";

const STORAGE_SESSION = "agile_insurance_session_v1";
// const STORAGE_LEGACY = "agile_insurance_auth_v1";
// const STORAGE_USERS = "agile_insurance_users_v1";
// const STORAGE_PENDING = "agile_insurance_pending_user_v1";

// // Auth provider is now frontend-only and stores demo users in localStorage.
// const safeJsonParse = (value, fallback) => {
//   try {
//     return JSON.parse(value);
//   } catch {
//     return fallback;
//   }
// };

// const readUsers = () => {
//   const users = safeJsonParse(localStorage.getItem(STORAGE_USERS), []);
//   // Keep old/corrupted localStorage values from breaking register/login array checks.
//   if (Array.isArray(users)) return users;
//   localStorage.setItem(STORAGE_USERS, JSON.stringify([]));
//   return [];
// };

// const writeUsers = (users) => {
//   localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
// };

const normalizeUser = (user) => ({
  id: user?._id || user?.id || `usr_${Date.now()}`,
  fullName: user?.fullName || user?.name || "",
  email: user?.email || "",
  phone: user?.phone || "",
  address: user?.address || "",
  role: user?.role || "user",
  createdAt: user?.createdAt || user?.created_at || new Date().toISOString(),
  ...user,
});

const saveSession = (token, user) => {
  setToken(token);
  localStorage.setItem(
    STORAGE_SESSION,
    JSON.stringify({ user })
  );
};



// Developer note: replace this with a backend/email OTP provider when real email delivery is added.
// const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const bootstrapUser = () => {
    const session = localStorage.getItem(STORAGE_SESSION);

    if (!session) return null;

    try {
        return JSON.parse(session).user;
    } catch {
        return null;
    }
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => bootstrapUser());
  const [bootstrapped] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!getToken()) return;

      try {
        const response = await apiRequest("/api/auth/me");
        const nextUser = normalizeUser(response?.data || response?.user || null);

        if (nextUser?.email) {
          saveSession(getToken(), nextUser);
          setUser(nextUser);
        }
      } catch {
        setToken("");
        localStorage.removeItem(STORAGE_SESSION);
        setUser(null);
      }
    };

    restoreSession();
  }, []);

  // Developer note: keep registration fields in sync with AuthPage and admin readRealUsers().
  const register = async ({ fullName, email, phone, address, password }) => {
    const response = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: fullName,
        email,
        phone,
        password,
        address,
        role: "user",
      }),
    });

    const token = response?.data?.token;
    const rawUser = response?.data?.user;

    if (!token || !rawUser) {
      throw new Error(response?.message || "Registration failed.");
    }

    const nextUser = normalizeUser(rawUser);
    saveSession(token, nextUser);
    setUser(nextUser);

    return { message: response?.message || "Account created successfully. You are now signed in.", user: nextUser };
  };

  // Developer note: verification currently checks the pending localStorage record.
  // const verifyOtp = async ({ email, otp }) => {
  //   const pending = safeJsonParse(localStorage.getItem(STORAGE_PENDING), null);
  //   if (!pending || pending.email !== email) throw new Error("No pending registration found for this email.");
  //   if (otp !== pending.otp) throw new Error("Invalid OTP. Enter the latest code sent to your email.");

  //   const users = readUsers();
  //   const verifiedUser = {
  //     id: pending.id,
  //     fullName: pending.fullName,
  //     email: pending.email,
  //     phone: pending.phone,
  //     address: pending.address || "",
  //     createdAt: pending.createdAt,
  //   };

  //   writeUsers([...users, { ...verifiedUser, password: pending.password }]);
  //   localStorage.removeItem(STORAGE_PENDING);
  //   saveSession(`frontend_demo_${Date.now()}`, verifiedUser);
  //   // saveSession(verifiedUser);
  //   setUser(verifiedUser);
  //   return verifiedUser;
  // };

  const login = async ({ email, password }) => {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const token = response?.data?.token;
    const rawUser = response?.data?.user;

    if (!token || !rawUser) {
      throw new Error(response?.message || "Login failed.");
    }

    const loggedInUser = normalizeUser(rawUser);
    saveSession(token, loggedInUser);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const googleLogin = async () => {
    const googleUser = {
      id: `google_${Date.now()}`,
      fullName: "Google User",
      email: "google-user@agileclaim.demo",
      phone: "",
      address: "",
      createdAt: new Date().toISOString(),
    };
    saveSession(`frontend_demo_${Date.now()}`, googleUser);
    setUser(googleUser);
    return googleUser;
  };


  const logout = async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST", skipAuth: false });
    } catch {
      // Ignore backend logout errors and clear the local session anyway.
    }

    setToken(null);
localStorage.removeItem(STORAGE_SESSION);
setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      bootstrapped,
      register,
      // verifyOtp,
      login,
      // googleLogin,
      logout,
    }),
    [bootstrapped, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
