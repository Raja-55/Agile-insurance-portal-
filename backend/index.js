const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

dotenv.config({ path: path.resolve(__dirname, ".env") });

const appConfig = require("./Config/app.config");
const connectDB = require("./db/connect");
// const errorHandler = require("./Middlewares/error.middleware");

// Routes
const authRoutes = require("./Routes/auth.route");
const adminRoutes = require("./Routes/admin.route");
const userRoutes = require("./Routes/user.route");
const kycRoutes = require("./Routes/kyc.route");
const supportRoutes = require("./Routes/support.route");
const userProfileRoutes = require("./Routes/userProfile.route");
const policyRoutes = require("./Routes/policy.routes");
const adminSupportRoutes = require("./Routes/adminSupport.route");

const PORT = appConfig.port;
const documentRoutes = require("./Routes/document.route");
const claimRoutes = require("./Routes/claim.route");
const uploadRoutes = require("./Routes/upload.route");
const purchaseRoutes = require("./Routes/purchase.route");
const notificationRoutes = require("./Routes/notification.route");
// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = Array.isArray(appConfig.clientUrl) ? appConfig.clientUrl : [appConfig.clientUrl];
      
      
      const isAllowed =
  !origin ||
  allowedOrigins.includes(origin) ||
  /https?:\/\/localhost(:\d+)?/.test(origin) ||
  /https:\/\/.*\.onrender\.com/.test(origin) ||
  /https:\/\/.*\.vercel\.app/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Origin not allowed by CORS: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting (100 req / 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api/', limiter);

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/profile", userProfileRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/admin", adminSupportRoutes);
app.use("/api/documents", documentRoutes);

app.use("/api/claims", claimRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);
//404 handler 
app.use((req, res) => {
  res.status(404).
      json({ 
        success: false, 
        message: `Route ${req.originalUrl} not found` 
      });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err?.name === "MongooseError" || /buffering timed out|querySrv|ECONNREFUSED|ENOTFOUND/i.test(err?.message || "")) {
    return res.status(503).json({
      success: false,
      message: "Database is unavailable.",
      details: err?.message || "Unable to reach MongoDB.",
    });
  }

  console.error("Server error:", err);

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const startServer = async () => {
  try {
    const dbReady = await connectDB();

    if (dbReady) {
      console.log("MongoDB Connected");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
};

startServer();