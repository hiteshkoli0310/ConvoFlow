import FollowRequest from "../models/FollowRequest.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";

export const sendFollowRequest = async (req, res) => {
  try {
    const from = req.user._id;
    const { userId: to } = req.params;
    if (from.toString() === to) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot follow yourself" });
    }

    // If already following, no need
    const me = await User.findById(from).select("following");
    if (me.following?.some((id) => id.toString() === to)) {
      return res
        .status(200)
        .json({ success: true, message: "Already following" });
    }

    const reqDoc = await FollowRequest.findOneAndUpdate(
      { from, to },
      { $setOnInsert: { status: "pending" } },
      { upsert: true, new: true }
    );

    // notify target
    const toSocket = userSocketMap[to];
    if (toSocket)
      io.to(toSocket).emit("followRequest", { _id: reqDoc._id, from });

    res.json({ success: true, request: reqDoc });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getIncomingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await FollowRequest.find({ to: userId, status: "pending" })
      .sort({ createdAt: -1 })
      .populate("from", "fullName profilePic");
    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const getIncomingRequestsPreview = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await FollowRequest.find({ to: userId, status: "pending" })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("from", "fullName profilePic");
    res.json({ success: true, requests });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const acceptFollowRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;
    const reqDoc = await FollowRequest.findOne({
      _id: requestId,
      to: userId,
      status: "pending",
    });
    if (!reqDoc)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });

    // Make follow mutual on accept: A<->B
    await User.findByIdAndUpdate(reqDoc.from, {
      $addToSet: { following: reqDoc.to, followers: reqDoc.to },
    });
    await User.findByIdAndUpdate(reqDoc.to, {
      $addToSet: { following: reqDoc.from, followers: reqDoc.from },
    });

    reqDoc.status = "accepted";
    await reqDoc.save();

    // notify both users
    const fromSocket = userSocketMap[reqDoc.from.toString()];
    const toSocket = userSocketMap[reqDoc.to.toString()];
    if (fromSocket) io.to(fromSocket).emit("followAccepted", { by: userId });
    if (toSocket)
      io.to(toSocket).emit("followAccepted", { by: reqDoc.from.toString() });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const rejectFollowRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;
    const reqDoc = await FollowRequest.findOne({
      _id: requestId,
      to: userId,
      status: "pending",
    });
    if (!reqDoc)
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    reqDoc.status = "rejected";
    await reqDoc.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const checkMutualFollow = async (req, res) => {
  try {
    const meId = req.user._id.toString();
    const { userId } = req.params;
    const [me, other] = await Promise.all([
      User.findById(meId).select("following followers"),
      User.findById(userId).select("following followers"),
    ]);
    if (!me || !other)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const iFollow = other.followers?.some((id) => id.toString() === meId);
    const theyFollow = me.followers?.some((id) => id.toString() === userId);
    const mutual = iFollow && theyFollow;
    res.json({ success: true, mutual });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
