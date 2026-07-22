<<<<<<< HEAD
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

dotenv.config({ path: ".env" });

const appConfig = require("./Config/app.config");
const connectDB = require("./db/connect");
const errorHandler = require("./Middlewares/error.middleware");
const AppError = require("./Utils/appError");

// Routes
const authRoutes = require("./Routes/auth.route");
const adminRoutes = require("./Routes/admin.route");
const userRoutes = require("./Routes/user.route");
const kycRoutes = require("./Routes/kyc.route");
const supportRoutes = require("./Routes/support.route");
const userProfileRoutes = require("./Routes/userProfile.route");
const policyRoutes = require("./Routes/policy.routes");
const purchaseRoutes = require("./Routes/purchase.routes");
const claimRoutes = require("./Routes/claim.routes");
const supportTicketRoutes = require("./Routes/supportTicket.routes");
const uploadRoutes = require("./Routes/upload.route");



const PORT = appConfig.port;

// Connect Database
connectDB();

// Middleware
const allowedOrigins = Array.isArray(appConfig.clientUrl)
  ? appConfig.clientUrl
  : [appConfig.clientUrl];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => allowed === origin);

      if (
        isAllowed ||
        (origin.startsWith("https://agile-insurance-portal") && origin.endsWith(".vercel.app"))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));



// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (100 req / 15 min per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api/', limiter);
// Request Logger Middleware
// app.use((req, res, next) => {
//   console.log("\n========== REQUEST ==========");
//   console.log("Method:", req.method);
//   console.log("URL:", req.originalUrl);
//   console.log("Body:", req.body);
//   console.log("Params:", req.params);
//   console.log("Query:", req.query);
//   console.log("=============================\n");

//   next();
// });

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
app.use("/api/purchases", purchaseRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api", supportTicketRoutes);
app.use("/api/upload", uploadRoutes);


//404 handler 
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler — uses the proper errorHandler middleware which reads err.statusCode
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
=======
const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require('express-rate-limit');

dotenv.config({ path: ".env" });

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

// Middleware
const allowedOrigins = Array.isArray(appConfig.clientUrl)
  ? appConfig.clientUrl
  : [appConfig.clientUrl];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => allowed === origin);

      if (
        isAllowed ||
        (origin.startsWith("https://agile-insurance-portal") && origin.endsWith(".vercel.app"))
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
const path = require("path");

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
  console.error("Server error:", err);

  console.log("err.statusCode =", err.statusCode, typeof err.statusCode);
  console.log("err.status =", err.status, typeof err.status);

  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

startServer();
>>>>>>> raj
