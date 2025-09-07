import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Middleware to protect routes
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};
