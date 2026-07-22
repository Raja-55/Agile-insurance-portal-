const normalizeEnvValue = (value) =>
  typeof value === "string" ? value.trim().replace(/^['"]+|['";]+$/g, "").trim() : value;

const appConfig = {
  get port() {
    return Number.parseInt(process.env.PORT, 10) || 3000;
  },
  get mongoUri() {
    return process.env.MONGO_URI;
  },
  get jwtSecret() {
    return normalizeEnvValue(process.env.JWT_SECRET || process.env.JWT_TOKEN);
  },
  get jwtExpiresIn() {
    return normalizeEnvValue(process.env.JWT_EXPIRES_IN || process.env.JWT_TOKEN_EXPIREY || "1d") || "1d";
  },
  get clientUrl() {
    const rawVal = process.env.CLIENT_URL;
    if (rawVal) {
      const normalized = normalizeEnvValue(rawVal);
      if (normalized.includes(",")) {
        return normalized.split(",").map(url => url.trim());
      }
      return normalized;
    }
    return ["http://localhost:5173", "http://localhost:5174", "https://agile-insurance-portal-three.vercel.app"];
  },
};

module.exports = appConfig;
