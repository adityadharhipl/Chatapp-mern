import express from "express";
import cors from "cors";

import authRoutes
from "./modules/auth/auth.routes.js";

import userRoutes
from "./modules/user/user.routes.js";

import messageRoutes
from "./modules/message/message.routes.js";

import groupRoutes
from "./modules/group/group.routes.js";


const app = express();

app.use(cors());

app.use(express.json());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
 "/api/messages",
 messageRoutes
);

app.use(
  "/api/groups",
  groupRoutes
);

export default app;