import express from "express";
import protect from "../../middleware/auth.middleware.js";
import { 
  getAllUsers, 
  sendFriendRequest, 
  acceptFriendRequest, 
  getFriendRequests, 
  getFriends 
} from "./user.controller.js";

const router = express.Router();

router.get("/all", protect, getAllUsers);
router.post("/request/:id", protect, sendFriendRequest);
router.post("/accept/:id", protect, acceptFriendRequest);
router.get("/requests", protect, getFriendRequests);
router.get("/friends", protect, getFriends);

export default router;