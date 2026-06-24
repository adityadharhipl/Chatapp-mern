const activeUsers = new Map(); // Map userId to socket.id

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // When a user logs in / connects
    socket.on("register_user", (userId) => {
      activeUsers.set(userId, socket.id);
      console.log(`User ${userId} registered to socket ${socket.id}`);

      // Broadcast to all clients the list of currently online user IDs
      io.emit("online_users", Array.from(activeUsers.keys()));
    });

    // 1-on-1 Private Message
    socket.on("private_message", (data) => {
      const { senderId, receiverId, text, time, senderName } = data;
      const receiverSocketId = activeUsers.get(receiverId);

      console.log(`Private msg from ${senderId} to ${receiverId}: ${text}`);

      if (receiverSocketId) {
        // Send to receiver
        io.to(receiverSocketId).emit("receive_private_message", data);
      }

      // Send back to sender so their UI updates
      const senderSocketId = activeUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("receive_private_message", data);
      }
    });

    // Global chat message (keeping it for later as requested)
    socket.on("send_message", (data) => {
      console.log("Global Message received:", data);
      io.emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      // Find and remove user from active map
      let disconnectedUserId = null;
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          activeUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`User ${disconnectedUserId} disconnected.`);
        // Broadcast updated online users
        io.emit("online_users", Array.from(activeUsers.keys()));
      }
    });
  });
};

export default socketHandler;
