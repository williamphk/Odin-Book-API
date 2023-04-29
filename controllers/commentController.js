const { body, validationResult } = require("express-validator");

const User = require("../models/user");
const Like = require("../models/like");

/* GET user comments listing. */
exports.comment_listing = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("post")
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
  body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Content is required")
    .isLength({ max: 200 })
    .withMessage("Content must be less than 200 characters")
    .escape(),

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
  body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Content is required")
    .isLength({ max: 200 })
    .withMessage("Content must be less than 200 characters")
    .escape(),

  async (req, res, next) => {
    const errors = validationResult(req);
    const comment = new Comment({
      user: req.user._id,
      content: req.body.content,
      post: req.params.postId,
      _id: req.params.commentId,
    });

    if (!errors.isEmpty()) {
      res.status(400).json({ comment, errors: errors.array() });
      return next(errors);
    }

    try {
      await Comment.updateOne({ _id: req.params.commentId }, comment);
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
    const comment = await Comment.findById(commentId);
    const likes = await Like.find({ comment: commentId });
    if (comment == null) {
      return res.status(404).json({ message: "Comment not found" });
    }
    await Comment.deleteOne({ _id: commentId });
    if (likes) {
      await Like.deleteMany({ comment: commentId });
    }
    return res
      .status(200)
      .json({ message: "Comment and related likes deleted" });
  } catch (err) {
    next(err);
  }
};
