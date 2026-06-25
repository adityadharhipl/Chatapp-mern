import { containsBadWords, censorMessage, WARNING_MESSAGE } from "../utils/badWordsFilter.js";
import { getAIResponse } from "../services/ai.service.js";

const activeUsers = new Map(); 
const aiRateLimits = new Map();
const AI_RATE_LIMIT_MS = 5000; 

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
    socket.on("private_message", async (data) => {
      const { senderId, receiverId, text, time, senderName } = data;

      // Check for bad words in private messages
      if (containsBadWords(text)) {
        // Send warning ONLY to sender
        const senderSocketId = activeUsers.get(senderId);
        if (senderSocketId) {
          socket.emit("message_blocked", {
            warning: WARNING_MESSAGE,
            originalText: text
          });
        }
        console.log(`⚠️ Private message BLOCKED from ${senderId}: "${text}"`);
        return; // Don't deliver the message
      }

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

      // --- AI Chatbot Integration for Private Chat ---
      const textTrimmed = text.trim();
      const textLower = textTrimmed.toLowerCase();
      
      let prompt = textTrimmed;
      if (textLower === "@ai" || textLower.startsWith("@ai ")) {
        prompt = textLower.startsWith("@ai ") ? textTrimmed.substring(4).trim() : "Hello!";
      }
      
      if (prompt) {
        const aiResponse = await getAIResponse(prompt);
        
        // To make sure the AI response shows up in the same chat window for both users:
        // For the sender, the chat window is identified by receiverId.
        // For the receiver, the chat window is identified by senderId.
        
        const aiDataForSender = {
          senderId: receiverId, // Group it under the friend's chat window
          receiverId: senderId,
          senderName: "AI Assistant",
          text: aiResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true
        };
        
        const aiDataForReceiver = {
          senderId: senderId, // Group it under the sender's chat window
          receiverId: receiverId,
          senderName: "AI Assistant",
          text: aiResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAI: true
        };
        
        if (senderSocketId) io.to(senderSocketId).emit("receive_private_message", aiDataForSender);
        if (receiverSocketId) io.to(receiverSocketId).emit("receive_private_message", aiDataForReceiver);
      }
    });

    // Global chat message — WITH BAD WORDS FILTER
    socket.on("send_message", async (data) => {
      // Check for bad words
      if (containsBadWords(data.text)) {
        // Send warning ONLY to sender (not to everyone)
        socket.emit("message_blocked", {
          warning: WARNING_MESSAGE,
          originalText: data.text
        });
        console.log(`⚠️ Global message BLOCKED from ${data.username}: "${data.text}"`);
        return; // Don't broadcast
      }

      console.log("Global Message received:", data);
      io.emit("receive_message", data);

      // --- AI Chatbot Integration ---
      const textTrimmed = data.text.trim();
      const textLower = textTrimmed.toLowerCase();
      
      const lastRequestTime = aiRateLimits.get(socket.id) || 0;
      const now = Date.now();
      
      if (now - lastRequestTime < AI_RATE_LIMIT_MS) {
        socket.emit("receive_message", {
          id: Date.now(),
          sender: "AI Assistant",
          username: "AI Assistant",
          text: "Please wait a few seconds before asking another question. ⏳",
          isAI: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date()
        });
        return;
      }

      aiRateLimits.set(socket.id, now);

      let prompt = textTrimmed;
      if (textLower === "@ai" || textLower.startsWith("@ai ")) {
        prompt = textLower.startsWith("@ai ") ? textTrimmed.substring(4).trim() : "Hello!";
      }
      
      if (prompt) {
        io.emit("aiTyping", true);

        const aiResponse = await getAIResponse(prompt);

        io.emit("aiTyping", false);
        io.emit("receive_message", {
          id: Date.now(),
          sender: "AI Assistant",
          username: "AI Assistant",
          text: aiResponse,
          isAI: true,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date()
        });
      }
    });

    socket.on("delete_global_message", (msgId) => {
      io.emit("global_message_deleted", msgId);
    });

    socket.on("delete_private_message", (data) => {
      const { msgId, receiverId, senderId } = data;
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_deleted", { msgId, chatId: senderId });
      }
    });

    socket.on("disconnect", async () => {
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
        try {
          const User = (await import("../modules/user/user.model.js")).default;
          await User.findByIdAndUpdate(disconnectedUserId, { lastSeen: new Date() });
        } catch (err) {
          console.error("Failed to update last seen", err);
        }
        // Broadcast updated online users
        io.emit("online_users", Array.from(activeUsers.keys()));
      }
    });
  });
};

export default socketHandler;
