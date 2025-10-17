import env from "./env.js";

function toBool(value) {
  if (typeof value === "boolean") return value;
  const s = String(value || "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const isProduction = (env.NODE_ENV || "").toLowerCase() === "production";

const config = {
  env: env.NODE_ENV,
  isProduction,
  port: toNumber(env.PORT, 3000),
  clientUrl: env.CLIENT_URL,
  clientUrls: (env.CLIENT_URLS || "").split(",").map(s => s.trim()).filter(Boolean),
  mongo: {
    uri: env.getMongoDB_URI(),
  },
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtl: env.JWT_ACCESS_EXPIRES_IN,
    refreshTtl: env.JWT_REFRESH_EXPIRES_IN,
  },
  passwordResetTtl: env.PASSWORD_RESET_EXPIRES_IN,
  cookie: {
    secure: toBool(env.COOKIE_SECURE ?? isProduction),
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth/refresh",
  },
  log: {
    level: (env.LOG_LEVEL || (isProduction ? "info" : "debug")).toLowerCase(),
    pretty: toBool(env.LOG_PRETTY || !isProduction),
  },
};

export default config;


