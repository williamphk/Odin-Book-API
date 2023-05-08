const { validationResult } = require("express-validator");

const Comment = require("../models/comment");
const Like = require("../models/like");

const { contentValidationRules } = require("./validationRules");

/* GET user comments listing. */
exports.comment_listing = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("post")
      .populate({
        path: "user",
        populate: {
          path: "profile",
        },
      })
      .sort({ createdAt: -1 }); // Sort by recency (descending order)

    res.status(200).json({ comments });
  } catch (err) {
    return next(err);
  }
};

/* GET comment details. */
exports.comment_details = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    res.json({ comment });
  } catch (err) {
    return next(err);
  }
};

/* POST comment. */
exports.comment_create = [
  ...contentValidationRules("content"),

  async (req, res, next) => {
    const errors = validationResult(req);
    const comment = new Comment({
      user: req.user._id,
      post: req.params.postId,
      content: req.body.content,
      createdAt: new Date(),
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({ comment, errors: errors.array() });
    }

    try {
      await comment.save();
      res.status(200).json({ message: "Comment created", comment });
    } catch (err) {
      return next(err);
    }
  },
];

/* PUT comment. */
exports.comment_update = [
  ...contentValidationRules("content"),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return next(errors);
    }

    try {
      const postUpdateResult = await Comment.updateOne(
        { _id: req.params.commentId },
        { content: req.body.content }
      );
      if (postUpdateResult.modifiedCount == 0) {
        return res.status(404).json({ message: "Comment not found" });
      }
      return res.status(200).json({ message: "Comment Updated" });
    } catch (err) {
      return next(err);
    }
  },
];

/* DELETE comment. */
exports.comment_delete = async (req, res, next) => {
  const commentId = req.params.commentId;
  try {
    // Delete Comment
    const commentDeleteResult = await Comment.deleteOne({ _id: commentId });
    if (commentDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Like not found" });
    }

    // Delete Comment's likes
    await Like.deleteMany({ comment: commentId });

    return res
      .status(200)
      .json({ message: "Comment and related likes deleted" });
  } catch (err) {
    next(err);
  }
};
