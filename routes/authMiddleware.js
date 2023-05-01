const mongoose = require("mongoose");

const { User } = require("../models/user");
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

module.exports.isPostUser = async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const postUser = await User.findById(post.user);
  if (!postUser) {
    return res.status(404).json({ message: "Post user not found" });
  }

  // Check if the user is the post user
  if (req.user._id.toString() !== postUser._id.toString()) {
    return res
      .status(401)
      .json({ message: "You are not the user of this post" });
  } else {
    next();
  }
};

module.exports.isPostUserAndUserFriends = async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const postUser = await User.findById(post.user);
  if (!postUser) {
    return res.status(404).json({ message: "Post user not found" });
  }

  const postUserFriends = await User.find({ friends: postUser._id });
  const postUserFriendsIds = postUserFriends.map((element) =>
    element._id.toString()
  );
  // Check if the user is the post user or post user's friend
  if (
    req.user._id.toString() !== postUser._id.toString() &&
    !postUserFriendsIds.includes(req.user._id.toString())
  ) {
    return res
      .status(401)
      .json({ message: "You are not the authorised to this post" });
  } else {
    next();
  }
};

module.exports.isCommentUser = async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const commentUser = await User.findById(comment.user);
  if (!commentUser) {
    return res.status(404).json({ message: "Comment user not found" });
  }

  // Check if the user is the post user
  if (req.user._id.toString() !== commentUser._id.toString()) {
    return res
      .status(401)
      .json({ message: "You are not the user of this comment" });
  } else {
    next();
  }
};

module.exports.isLikeUser = async (req, res, next) => {
  const like = await Like.findById(req.params.likeId);
  if (!like) {
    return res.status(404).json({ message: "Like not found" });
  }

  const likeUser = await User.findById(like.user);
  if (!likeUser) {
    return res.status(404).json({ message: "Like user not found" });
  }

  // Check if the user is the post user
  if (req.user._id.toString() !== likeUser._id.toString()) {
    return res
      .status(401)
      .json({ message: "You are not the user of this like" });
  } else {
    next();
  }
};
