import express from "express";
import protect from "../../middleware/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  addMember
} from "./group.controller.js";

const router = express.Router();

router.post("/", protect, createGroup);
router.get("/my", protect, getMyGroups);
router.get("/:groupId/messages", protect, getGroupMessages);
router.post("/:groupId/messages", protect, sendGroupMessage);
router.post("/:groupId/add-member", protect, addMember);

export default router;
