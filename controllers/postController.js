const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");
const Like = require("../models/like");

const { postContentValidationRules } = require("./validationRules");

/* GET user posts listing. */
exports.post_listing = async (req, res, next) => {
  try {
    // Fetch posts from the user
    const posts = await Post.find({ user: req.user._id })
      .populate("user")
      .sort({ createdAt: -1 }); // Sort by recency (descending order)

    res.status(200).json({ posts });
  } catch (err) {
    return next(err);
  }
};

/* GET post newsfeed listing. */
exports.post_newsfeed_listing = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch the user and their friends
    const user = await User.findById(userId);
    const friendIds = user.friends.map((friend) => friend._id);
    friendIds.push(userId); // Include user's own post

    // Fetch posts from the user and their friends
    const posts = await Post.find({ user: { $in: friendIds } })
      .populate("user")
      .sort({ createdAt: -1 }); // Sort by recency (descending order)

    res.status(200).json({ posts });
  } catch (err) {
    return next(err);
  }
};

/* GET post details. */
exports.post_details = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.status(200).json({ post });
  } catch (err) {
    return next(err);
  }
};

/* POST post. */
exports.post_create = [
  ...postContentValidationRules("content"),

  async (req, res, next) => {
    const errors = validationResult(req);
    const post = new Post({
      user: req.user._id,
      content: req.body.content,
      createdAt: new Date(),
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({ post, errors: errors.array() });
    }

    try {
      await post.save();
      res.status(200).json({ message: "Post created", post });
    } catch (err) {
      return next(err);
    }
  },
];

/* PUT post. */
exports.post_update = [
  ...postContentValidationRules("content"),

  async (req, res, next) => {
    const errors = validationResult(req);
    const post = new Post({
      user: req.user._id,
      content: req.body.content,
      _id: req.params.postId,
    });

    if (!errors.isEmpty()) {
      res.status(400).json({ post, errors: errors.array() });
      return next(errors);
    }

    try {
      await Post.updateOne({ _id: req.params.postId }, post);
      return res.status(200).json({ message: "Post Updated" });
    } catch (err) {
      return next(err);
    }
  },
];

/* DELETE post. */
exports.post_delete = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const postDeleteResult = await Post.deleteOne({ _id: postId });
    if (postDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete Post's comments
    await Comment.deleteMany({ post: postId });

    // Delete Post's likes and Post's comments' likes
    const comments = await Comment.find({ post: postId });
    const commentIds = comments.map((element) => element._id);
    await Like.deleteMany({
      $or: [{ post: postId }, { comment: { $in: commentIds } }],
    });

    return res
      .status(200)
      .json({ message: "Post, related comments and likes deleted" });
  } catch (err) {
    next(err);
  }
};
