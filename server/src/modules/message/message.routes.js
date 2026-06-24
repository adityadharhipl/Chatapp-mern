import express from "express";

import protect
from "../../middleware/auth.middleware.js";

import {
 sendMessage,
 getMessages
}
from "./message.controller.js";

const router =
 express.Router();

router.post(
 "/",
 protect,
 sendMessage
);

router.get(
 "/:receiverId",
 protect,
 getMessages
);

export default router;