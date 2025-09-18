const request = require('supertest');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import your modules
const softwareData = require('../data/softwareData');
const userStorage = require('../data/userStorage');
const authUtils = require('../utils/auth');

// Create test app
const createTestApp = () => {
  const app = express();
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use('/downloads', express.static(path.join(__dirname, '../downloads')));

  // Helper function to get file path for software
  function getSoftwareFilePath(softwareId) {
    const software = softwareData.find(s => s.id === softwareId);
    if (!software) return null;

    const fileMap = {
      1: 'browser/chrome-installer.exe',
      2: 'browser/firefox-installer.exe',
      3: 'media/vlc-installer.exe',
      4: 'media/spotify-installer.exe',
      5: 'utilities/7zip-installer.exe',
      6: 'utilities/winrar-installer.exe',
      7: 'browser/edge-installer.exe',
      8: 'utilities/ccleaner-installer.exe',
    };

    return fileMap[softwareId] || null;
  }

  // API Routes
  app.post("/api/register", async (req, res) => {
    try {
      const { fullName, email, password } = req.body;

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

      if (userStorage.emailExists(email)) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      const hashedPassword = await authUtils.hashPassword(password);
      const newUser = userStorage.create({
        fullName: fullName.trim(),
        email: email.trim(),
        password: hashedPassword,
      });

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
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const user = userStorage.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isValidPassword = await authUtils.comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = authUtils.generateToken({ id: user.id, email: user.email });

      res.json({
        success: true,
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

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
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  app.get("/api/software", (req, res) => {
    res.json(softwareData);
  });

  app.post("/api/download", authUtils.authenticateToken, (req, res) => {
    try {
      const { softwareIds } = req.body;
      const user = req.user;

      if (!softwareIds || !Array.isArray(softwareIds) || softwareIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Software IDs are required",
        });
      }

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

        const fullFilePath = path.join(__dirname, '../downloads', filePath);
        const fileName = `${software.name.replace(/\s+/g, '-').toLowerCase()}-installer.exe`;

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        res.sendFile(fullFilePath, (err) => {
          if (err) {
            res.status(404).json({
              success: false,
              message: "File not found",
            });
          }
        });
      } else {
        const downloadLinks = softwareIds
          .map((id) => {
            const software = softwareData.find((s) => s.id === id);
            const filePath = getSoftwareFilePath(id);
            return software && filePath
              ? {
                  id: id,
                  name: software.name,
                  downloadUrl: `http://localhost:5000/api/download-file/${id}`,
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
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  });

  return app;
};

module.exports = createTestApp;