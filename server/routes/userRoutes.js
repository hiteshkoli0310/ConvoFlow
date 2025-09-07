import express from "express";
import { updateProfile } from "../controllers/userController";

const UserRouter = express.Router();

UserRouter.post("/signup", signup);
UserRouter.post("login", login);
UserRouter.put("/update-profile", protectRoute, updateProfile);
UserRouter.get("check", protectRoute, checkAuth);

export default UserRouter;
