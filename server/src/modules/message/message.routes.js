import express from "express";

import protect
from "../../middleware/auth.middleware.js";

import {
 sendMessage,
 getMessages,
 deleteMessage
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

router.delete(
 "/:id",
 protect,
 deleteMessage
);

export default router;