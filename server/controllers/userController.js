import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";

//Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    // Check if user already exists
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    // Remove password from response
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      newUser: userResponse,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Controller to login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const userData = await User.findOne({ email });

    // Check if user exists
    if (!userData) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(userData._id);

    // Remove password from response
    const userResponse = { ...userData.toObject() };
    delete userResponse.password;

    res.status(200).json({
      success: true,
      userData: userResponse,
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

//Controller to update user profile
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!fullName || fullName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }

    let updateData = {
      bio: bio || "",
      fullName: fullName.trim(),
    };

    // Handle profile picture upload
    if (profilePic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic, {
          folder: "chat-app/profiles", // Optional: organize uploads
          transformation: [
            { width: 400, height: 400, crop: "fill" }, // Optional: resize images
          ],
        });
        updateData.profilePic = uploadResponse.secure_url;
      } catch (uploadError) {
        console.log("Cloudinary upload error:", uploadError);
        return res.status(400).json({
          success: false,
          message: "Failed to upload profile picture",
        });
      }
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true, // Run mongoose validations
    }).select("-password"); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return success response
    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.log("Update profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
