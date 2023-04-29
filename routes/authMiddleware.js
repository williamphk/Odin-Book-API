const mongoose = require("mongoose");

const Post = require("../models/post");
const FriendRequest = require("../models/friendRequest");

module.exports.isAdmin = (req, res, next) => {
  if (req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({
      message:
        "You are not authorized to view this resource because you are not an admin.",
    });
  }
};

module.exports.isUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the authenticated user is the user
    if (req.user._id.toString() === user._id.toString()) {
      next();
    } else {
      return res.status(401).json({
        message: "You are not this user",
      });
    }
  } catch (err) {
    next(err);
  }
};

module.exports.isUserFriendRequestSender = async (req, res, next) => {
  try {
    const friendRequest = await FriendRequest.findById(
      req.params.friendRequestId
    );
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Check if the authenticated user is the sender of the friend request
    if (req.user._id.toString() === friendRequest.sender.toString()) {
      return next();
    } else {
      return res
        .status(401)
        .json({ message: "You are not the sender of this friend request" });
    }
  } catch (err) {
    return next(err);
  }
};

module.exports.isUserFriendRequestReceiver = async (req, res, next) => {
  try {
    const friendRequest = await FriendRequest.findById(
      req.params.friendRequestId
    );
    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Check if the authenticated user is the receiver of the friend request
    if (req.user._id.toString() === friendRequest.receiver.toString()) {
      return next();
    } else {
      return res
        .status(401)
        .json({ message: "You are not the receiver of this friend request" });
    }
  } catch (err) {
    return next(err);
  }
};

module.exports.isUserPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate("user");
  if (
    post.user._id.toString() ===
    new mongoose.Types.ObjectId(req.user._id).toString()
  ) {
    next();
  } else {
    res.status(401).json({
      msg: "You are not this user",
    });
  }
};
