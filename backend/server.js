require("dotenv").config();
const express = require("express");
const cors = require("cors");
const softwareData = require("./data/softwareData");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  })
);
app.use(express.json());

// API Routes

// POST /api/register - Register endpoint
app.post("/api/register", (req, res) => {
  console.log("Register request received:", req.body);
  res.json({ success: true, message: "User registered successfully" });
});

// POST /api/login - Login endpoint
app.post("/api/login", (req, res) => {
  console.log("Login request received:", req.body);
  res.json({
    success: true,
    token: "dummy-token",
    message: "Login successful",
  });
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

// POST /api/download - Download endpoint
app.post("/api/download", (req, res) => {
  const { softwareIds } = req.body;
  console.log("Download request received for software IDs:", softwareIds);

  const downloadLinks = softwareIds
    .map((id) => {
      const software = softwareData.find((s) => s.id === id);
      return software
        ? {
            id: id,
            name: software.name,
            downloadUrl: `https://example.com/download/${software.name
              .replace(/\s+/g, "-")
              .toLowerCase()}`,
          }
        : null;
    })
    .filter(Boolean);

  res.json({
    success: true,
    downloadLinks: downloadLinks,
    message: "Download links generated successfully",
  });
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
