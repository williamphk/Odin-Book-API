const { body, validationResult } = require("express-validator");

const Post = require("../models/post");
const Comment = require("../models/comment");
const { User } = require("../models/user");
const Like = require("../models/like");

const { contentValidationRules } = require("./validationRules");

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
    const user = await User.findById(userId).populate("profile");
    const friendIds = user.profile.friends.map((friend) => friend._id);
    friendIds.push(userId); // Include user's own post

    // Fetch posts from the user and their friends
    const posts = await Post.find({ user: { $in: friendIds } })
      .populate({
        path: "user",
        populate: {
          path: "profile",
        },
      })
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
  ...contentValidationRules("content"),

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
  ...contentValidationRules("content"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return next(errors);
    }

    try {
      const postUpdateResult = await Post.updateOne(
        { _id: req.params.postId },
        { content: req.body.content }
      );
      if (postUpdateResult.modifiedCount == 0) {
        return res.status(404).json({ message: "Post not updated" });
      }
      return res.status(200).json({ message: "Post Updated" });
    } catch (err) {
      return next(err);
    }
  },
];

/* DELETE post. */
exports.post_delete = async (req, res, next) => {
  const { postId } = req.params;
  try {
    // Find comments related to the post
    const comments = await Comment.find({ post: postId });
    const commentIds = comments.map((element) => element._id);

    // Delete Post, Post's comments, and Post's likes and Post's comments' likes
    const [postDeleteResult, commentsDeleteResult, likesDeleteResult] =
      await Promise.all([
        Post.deleteOne({ _id: postId }),
        Comment.deleteMany({ post: postId }),
        Like.deleteMany({
          $or: [{ post: postId }, { comment: { $in: commentIds } }],
        }),
      ]);

    if (postDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Post not deleted" });
    }

    return res
      .status(200)
      .json({ message: "Post, related comments, and likes deleted" });
  } catch (err) {
    next(err);
  }
};
