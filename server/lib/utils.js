import jwt from "jsonwebtoken";

// Function to generate a JWT token for a given user ID
export const generateToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET);
  return token;
};
