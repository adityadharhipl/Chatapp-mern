import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import connectDB from "./config/db.js";
import socketHandler from "./socket/socket.js";


// Connect MongoDB
connectDB();

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Socket Events
socketHandler(io);

// Start Server
server.listen(process.env.PORT, () => {
  console.log(
    `🙂🙂 Server Running on Port ${process.env.PORT} 🙂🙂`
  );
});

// import dotenv from "dotenv";

// dotenv.config();

// import app from "./app.js";

// import connectDB
// from "./config/db.js";

// connectDB();

// app.listen(
//   process.env.PORT,
//   () => {

//     console.log(
//       `🙂🙂 Server Running on ${process.env.PORT} 🙂🙂`
//     );

//   }
// );