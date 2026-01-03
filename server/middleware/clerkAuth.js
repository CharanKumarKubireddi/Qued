const { clerkClient } = require('@clerk/clerk-sdk-node');
const User = require('../models/User');

const ClerkSync = async (req, res, next) => {
  try {
    const { userId } = req.auth; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1. Just find the user. DO NOT create them here anymore.
    let user = await User.findOne({ clerkId: userId });

    // 2. If user exists, attach to request. If not, req.user remains undefined.
    if (user) {
      req.user = { 
        id: user._id, 
        role: user.role, 
        clerkId: userId 
      };
    }

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { ClerkSync };