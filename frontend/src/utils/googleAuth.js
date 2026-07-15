export const canUseGoogleAuth = ({ clientId, mode, enableFlag }) => {
  const normalizedClientId = (clientId || "").trim();

  if (!normalizedClientId) return false;

  if (!/^[\w-]+\.apps\.googleusercontent\.com$/i.test(normalizedClientId)) {
    return false;
  }

  if (mode === "development") {
    return enableFlag === "true";
  }

  return true;
};

export const getGoogleAuthMessage = ({ clientId, mode, enableFlag }) => {
  if (!clientId || !clientId.trim()) {
    return "Google sign-in is not configured for this app.";
  }

  if (!canUseGoogleAuth({ clientId, mode, enableFlag })) {
    if (mode === "development") {
      return "Google sign-in is disabled in local development. Set VITE_ENABLE_GOOGLE_AUTH=true after allowing your origin in Google Console.";
    }

    return "Google sign-in is unavailable for the current origin. Add this URL to your Google OAuth client allowlist.";
  }

  return "";
};
