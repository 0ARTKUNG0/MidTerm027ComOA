require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const softwareData = require("./data/softwareData");
const userStorage = require("./data/userStorage");
const authUtils = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());

// Serve static files from downloads directory
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// API Routes

// Helper function to get file path for software
function getSoftwareFilePath(softwareId) {
  const software = softwareData.find((s) => s.id === softwareId);
  if (!software) return null;

  const fileMap = {
    1: "browser/chrome-installer.exe", // Google Chrome
    2: "browser/firefox-installer.exe", // Mozilla Firefox
    3: "media/vlc-installer.exe", // VLC Media Player
    4: "media/spotify-installer.exe", // Spotify
    5: "utilities/7zip-installer.exe", // 7-Zip
    6: "utilities/winrar-installer.exe", // WinRAR
    7: "browser/edge-installer.exe", // Microsoft Edge
    8: "utilities/ccleaner-installer.exe", // CCleaner
  };

  return fileMap[softwareId] || null;
}

// POST /api/register - Register endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    if (!authUtils.isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (!authUtils.isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Check if user already exists
    if (userStorage.emailExists(email)) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await authUtils.hashPassword(password);

    // Create user
    const newUser = userStorage.create({
      fullName: fullName.trim(),
      email: email.trim(),
      password: hashedPassword,
    });

    console.log(`New user registered: ${newUser.email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// POST /api/login - Login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = userStorage.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await authUtils.comparePassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = authUtils.generateToken(user);

    console.log(`User logged in: ${user.email}`);

    res.json({
      success: true,
      token: token,
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/software - Get all software
app.get("/api/software", (req, res) => {
  const { category, search } = req.query;

  let filteredSoftware = softwareData;

  // Filter by category
  if (category && category !== "All") {
    filteredSoftware = filteredSoftware.filter(
      (software) => software.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search term
  if (search) {
    filteredSoftware = filteredSoftware.filter(
      (software) =>
        software.name.toLowerCase().includes(search.toLowerCase()) ||
        software.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json(filteredSoftware);
});

// POST /api/download - Download endpoint (Protected)
app.post("/api/download", authUtils.authenticateToken, (req, res) => {
  try {
    const { softwareIds } = req.body;
    const user = req.user; // From JWT token

    console.log(
      `Download request from user ${user.email} for software IDs:`,
      softwareIds
    );

    if (
      !softwareIds ||
      !Array.isArray(softwareIds) ||
      softwareIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Software IDs are required",
      });
    }

    // For single file download, serve the file directly
    if (softwareIds.length === 1) {
      const softwareId = softwareIds[0];
      const software = softwareData.find((s) => s.id === softwareId);
      const filePath = getSoftwareFilePath(softwareId);

      if (!software || !filePath) {
        return res.status(404).json({
          success: false,
          message: "Software not found",
        });
      }

      const fullFilePath = path.join(__dirname, "downloads", filePath);
      const fileName = `${software.name
        .replace(/\s+/g, "-")
        .toLowerCase()}-installer.exe`;

      // Set headers for file download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", "application/octet-stream");

      // Send the file
      res.sendFile(fullFilePath, (err) => {
        if (err) {
          console.error("File send error:", err);
          res.status(404).json({
            success: false,
            message: "File not found",
          });
        } else {
          console.log(
            `File downloaded successfully: ${fileName} by ${user.email}`
          );
        }
      });
    } else {
      // For multiple files, return download links
      const downloadLinks = softwareIds
        .map((id) => {
          const software = softwareData.find((s) => s.id === id);
          const filePath = getSoftwareFilePath(id);
          return software && filePath
            ? {
                id: id,
                name: software.name,
                downloadUrl: `${
                  process.env.API_BASE_URL || `http://localhost:${PORT}`
                }/api/download-file/${id}`,
                requestedBy: user.email,
                requestedAt: new Date().toISOString(),
              }
            : null;
        })
        .filter(Boolean);

      res.json({
        success: true,
        downloadLinks: downloadLinks,
        message: "Download links generated successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/download-file/:id - Individual file download (Protected)
app.get("/api/download-file/:id", authUtils.authenticateToken, (req, res) => {
  try {
    const softwareId = parseInt(req.params.id);
    const user = req.user;

    const software = softwareData.find((s) => s.id === softwareId);
    const filePath = getSoftwareFilePath(softwareId);

    if (!software || !filePath) {
      return res.status(404).json({
        success: false,
        message: "Software not found",
      });
    }

    const fullFilePath = path.join(__dirname, "downloads", filePath);
    const fileName = `${software.name
      .replace(/\s+/g, "-")
      .toLowerCase()}-installer.exe`;

    // Set headers for file download
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    // Send the file
    res.sendFile(fullFilePath, (err) => {
      if (err) {
        console.error("File send error:", err);
        res.status(404).json({
          success: false,
          message: "File not found",
        });
      } else {
        console.log(
          `File downloaded successfully: ${fileName} by ${user.email}`
        );
      }
    });
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/profile - Get user profile (Protected)
app.get("/api/profile", authUtils.authenticateToken, (req, res) => {
  try {
    const user = userStorage.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// GET /api/stats - Get system statistics (Optional admin endpoint)
app.get("/api/stats", (req, res) => {
  try {
    res.json({
      success: true,
      stats: {
        totalUsers: userStorage.count(),
        totalSoftware: softwareData.length,
        serverUptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
        version: process.env.VERSION || "1.0.0",
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 ${
      process.env.SERVER_NAME || "Backend server"
    } is running on http://localhost:${PORT}`
  );
  console.log(
    `📡 API endpoints available at http://localhost:${PORT}${
      process.env.API_BASE_URL || "/api"
    }/`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📝 Version: ${process.env.VERSION || "1.0.0"}`);
});
