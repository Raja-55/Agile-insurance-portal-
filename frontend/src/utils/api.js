const TOKEN_KEY = "agile_insurance_api_token_v1";
const ADMIN_TOKEN_KEY = "agile_insurance_admin_token_v1";
const ADMIN_PROFILE_KEY = "agile_insurance_admin_profile_v1";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "https://agile-insurance-portal-qa90.onrender.com").replace(/\/$/, "");

const initialsFromName = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  return (parts[0]?.slice(0, 2) || "AD").toUpperCase();
};

// Frontend-only session token helpers. No backend API server is required.
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

// Separate token store for the admin portal so an admin session never collides
// with (or gets overwritten by) a user-portal session in the same browser.
export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token) => {
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const normalizeAdminProfile = (admin = {}) => ({
  adminId: admin.adminId || admin.id || admin._id || "",
  name: admin.fullName || admin.name || admin.full_name || "Admin",
  email: admin.email || "",
  role: admin.role || "Admin",
  profilePhoto: admin.profilePhoto || admin.profile_photo || "",
  initials: initialsFromName(admin.fullName || admin.name || admin.full_name || admin.email || "Admin"),
  access: admin.role || "Admin",
  password: "",
});

export const saveAdminSession = (token, admin) => {
  setAdminToken(token);

  const profile = normalizeAdminProfile(admin || {});
  localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(profile));
  return profile;
};

export const getAdminProfile = () => {
  try {
    const saved = localStorage.getItem(ADMIN_PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  setAdminToken(null);
  localStorage.removeItem(ADMIN_PROFILE_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const { useAdminToken, skipAuth, ...fetchOptions } = options;
  const token = useAdminToken ? getAdminToken() : getToken();
  const headers = new Headers(fetchOptions.headers || {});

  if (!(fetchOptions.body instanceof FormData)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  if (token && !skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    credentials: "include",
    ...fetchOptions,
    headers,
  });

  const rawText = await response.text();

  let payload = {};
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = { message: rawText };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && useAdminToken) {
      clearAdminSession();
    }
    throw new Error(payload?.message || payload?.error || rawText || "Request failed.");
  }

  return payload;
};

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });

export const fileToBase64 = async (file) => {
  const dataUrl = await fileToDataUrl(file);
  return dataUrl.split(",")[1] || "";
};

const readOpenAiText = (payload) => {
  if (payload?.output_text) return payload.output_text;
  const parts = payload?.output?.flatMap((item) => item?.content || []) || [];
  return parts.map((part) => part?.text || "").filter(Boolean).join("\n").trim();
};

// Browser OpenAI calls are useful for demos, but production apps should proxy this through a secure server.
export const openAiChat = async ({ message, history = [], contextLabel = "Agile AI", systemContext = null }) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Add VITE_OPENAI_API_KEY to your frontend environment to enable OpenAI chat.");
  }

  const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-5.5";
  const conversation = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");
  const portalKnowledge = systemContext ? JSON.stringify(systemContext, null, 2) : "{}";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions:
        [
          "You are Agile AI, the insurance assistant for the Agile Insurance / Agile Claim portal.",
          "Answer only questions related to this insurance system: policies, policy comparison, coverage, premiums, checkout, payments, claims, renewals, documents, KYC demo status, dashboard navigation, profile/security settings, and contact support.",
          "If the user asks about unrelated topics, refuse briefly: 'I can only help with Agile Insurance portal questions like policies, claims, payments, renewals, documents, or support.'",
          "Use the provided portal knowledge as your source of truth. Do not invent policy terms, prices, account records, payment status, or claim status not present in the context.",
          "For legal, medical, financial, or claim approval decisions, give general portal guidance and tell the user to contact support.",
          "Keep answers concise, practical, and step-by-step when explaining portal actions.",
        ].join(" "),
      input: [
        `Portal knowledge:\n${portalKnowledge}`,
        conversation ? `Conversation so far:\n${conversation}` : `Start a new ${contextLabel} conversation.`,
        `User message: ${message}`,
      ].join("\n\n"),
      max_output_tokens: 500,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || "OpenAI chat request failed.");
  }

  return readOpenAiText(payload) || "I could not produce an answer. Please try again.";
};






// // ==================== USER AUTH APIs ====================

// // Register
// export const registerUser = (data) =>
//   apiRequest("/api/auth/register", {
//     method: "POST",
//     body: JSON.stringify(data),
//     skipAuth: true,
//   });

// // Login
// export const loginUser = async (data) => {
//   const response = await apiRequest("/api/auth/login", {
//     method: "POST",
//     body: JSON.stringify(data),
//     skipAuth: true,
//   });

//   // Save JWT
//   if (response?.data?.token) {
//     setToken(response.data.token);
//   }

//   return response;
// };

// // Logout
// export const logoutUser = async () => {
//   await apiRequest("/api/auth/logout", {
//     method: "POST",
//   });

//   setToken(null);
// };

// // Logged-in user
// export const getCurrentUser = () =>
//   apiRequest("/api/auth/me");

// // Update profile
// export const updateProfile = (data) =>
//   apiRequest("/api/auth/update-profile", {
//     method: "PUT",
//     body: JSON.stringify(data),
//   });

// // Change password
// export const changePassword = (data) =>
//   apiRequest("/api/auth/change-password", {
//     method: "PUT",
//     body: JSON.stringify(data),
//   });
