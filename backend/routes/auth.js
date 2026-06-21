const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: { $regex: new RegExp(`^${normalizedUsername.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}$`, 'i') } }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        name: user.name,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const loginKey = username.trim();

    const user = await User.findOne({
      $or: [
        { username: { $regex: new RegExp(`^${loginKey.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}$`, 'i') } },
        { email: loginKey.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid username or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        name: user.name,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;