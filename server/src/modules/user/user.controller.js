import User from "./user.model.js";

// Get all users (excluding self, existing friends, and those we've sent requests to or received from)
export const getAllUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // Find users who are NOT the current user, NOT in friends, and NOT in friendRequests
    // To make it simple for the UI, we'll just return all users except self, 
    // and let the frontend filter or we filter here. Let's filter here.
    const users = await User.find({
      _id: { 
        $ne: req.user._id,
        $nin: [...currentUser.friends, ...currentUser.friendRequests]
      },
      // also exclude users who have US in their friendRequests (we sent them a request)
      friendRequests: { $ne: req.user._id }
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (receiver.friends.includes(senderId) || receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "Request already sent or already friends" });
    }

    receiver.friendRequests.push(senderId);
    await receiver.save();

    res.json({ message: "Friend request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver.friendRequests.includes(senderId)) {
      return res.status(400).json({ message: "No friend request found from this user" });
    }

    // Remove from requests, add to friends
    receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId.toString());
    receiver.friends.push(senderId);
    await receiver.save();

    // Add to sender's friends too
    sender.friends.push(receiverId);
    await sender.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests', 'name email isOnline lastSeen');
    res.json(user.friendRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friends
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email isOnline lastSeen');
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};