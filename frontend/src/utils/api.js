const TOKEN_KEY = "agile_insurance_api_token_v1";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

// Frontend-only session token helpers. No backend API server is required.
export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  }

  if (token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    credentials: "include",
    ...options,
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
