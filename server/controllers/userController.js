import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

//Signup a new user
export const signup = async () => {
  const { fullname, email, password, bio } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.json({
      success: true,
      userData: newUser,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.json({ success: false, message: "Server error" });
  }
};

//Controller for user login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      userData: user,
      token,
      message: "Login successful",
    });
    await user.save();
  } catch (error) {
    console.error("Error during login:", error);
    res.json({ success: false, message: "Server error" });
  }
};

//Controller to check if user is authenticated
export const isAuthenticated = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, userData: user });
  } catch (error) {
    console.error("Error checking authentication:", error);
    res.json({ success: false, message: "Server error" });
  }
};

//Controller to get user profile
export const getProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, userData: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.json({ success: false, message: "Server error" });
  }
};

//Controller to update user profile
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { profilePic, fullname, bio } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
        width: 150,
        height: 150,
        crop: "fill",
        gravity: "face",
        format: "png",
        public_id: `profile_${userId}`,
        overwrite: true,
      });
      user.profilePic = uploadResponse.secure_url;
    }
    if (fullname) user.fullname = fullname;
    if (bio) user.bio = bio;
    await user.save();
    res.json({ success: true, userData: user, message: "Profile updated" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.json({ success: false, message: "Server error" });
  }
};
