import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../lib/utils.js";

// Signup Controller
export const signup = async (req, res) => {
  const { fullName, username, email, password, bio } = req.body;
  try {
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const uname = String(username).trim().toLowerCase();
    if (!/^\S+$/.test(uname)) {
      return res
        .status(400)
        .json({ success: false, message: "Username must not contain spaces" });
    }

    const existingByEmail = await User.findOne({ email });
    const existingByUsername = await User.findOne({ username: uname });
    if (existingByEmail || existingByUsername) {
      return res.status(400).json({
        success: false,
        message: existingByEmail
          ? "Email already in use"
          : "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      username: uname,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      userData: userResponse,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required",
      });
    }

    const identifier =
      username?.trim().toLowerCase() || email?.trim().toLowerCase();
    const query = username ? { username: identifier } : { email: identifier };
    const user = await User.findOne(query);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      userData: userResponse,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check Auth Controller
export const checkAuth = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName, preferredLanguage } = req.body;
    const userId = req.user._id;

    if (!fullName || fullName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    const updateData = {
      fullName: fullName.trim(),
      bio: bio || "",
    };

    if (preferredLanguage) {
      updateData.preferredLanguage = preferredLanguage;
    }

    if (profilePic) {
      try {
        const uploadResult = await cloudinary.uploader.upload(profilePic, {
          folder: "chat-app/profiles",
          transformation: [{ width: 400, height: 400, crop: "fill" }],
        });
        updateData.profilePic = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user by username (protected)
export const getUserByUsername = async (req, res) => {
  try {
    const meId = req.user._id.toString();
    const uname = String(req.params.username || "")
      .trim()
      .toLowerCase();
    if (!uname)
      return res
        .status(400)
        .json({ success: false, message: "Username is required" });

    const user = await User.findOne({ username: uname }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // mutual follow check
    const me = await User.findById(meId).select("following");
    const other = await User.findById(user._id).select("following");
    const meFollows = me?.following?.some(
      (id) => id.toString() === String(user._id)
    );
    const theyFollow = other?.following?.some((id) => id.toString() === meId);
    const mutualFollow = Boolean(meFollows && theyFollow);

    res.json({ success: true, user, mutualFollow });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Search users by username (protected)
export const searchUsers = async (req, res) => {
  try {
    const meId = req.user._id.toString();
    const q = String(req.query.q || "")
      .trim()
      .toLowerCase();
    if (!q) return res.json({ success: true, users: [] });

    // simple substring match; can be improved with full-text index later
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const found = await User.find({ username: regex, _id: { $ne: meId } })
      .select("fullName username profilePic followers following")
      .limit(7);

    const me = await User.findById(meId).select("following");
    const users = found.map((u) => {
      const meFollows = me.following?.some(
        (id) => id.toString() === u._id.toString()
      );
      const theyFollow = u.following?.some((id) => id.toString() === meId);
      return {
        _id: u._id,
        fullName: u.fullName,
        username: u.username,
        profilePic: u.profilePic,
        mutualFollow: Boolean(meFollows && theyFollow),
      };
    });
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
