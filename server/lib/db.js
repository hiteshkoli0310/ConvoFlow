import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected to DB");
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/ConvoFlow`);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
  }
};
