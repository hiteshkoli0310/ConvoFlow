import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  sendFollowRequest,
  getIncomingRequests,
  getIncomingRequestsPreview,
  acceptFollowRequest,
  rejectFollowRequest,
  checkMutualFollow,
} from "../controllers/followController.js";

const followRouter = express.Router();

followRouter.post("/request/:userId", protectRoute, sendFollowRequest);
followRouter.get("/incoming", protectRoute, getIncomingRequests);
followRouter.get("/incoming/preview", protectRoute, getIncomingRequestsPreview);
followRouter.post("/accept/:requestId", protectRoute, acceptFollowRequest);
followRouter.post("/reject/:requestId", protectRoute, rejectFollowRequest);
followRouter.get("/mutual/:userId", protectRoute, checkMutualFollow);

export default followRouter;
