const Like = require("../models/like");

/* Get comment like listing */
exports.comment_like_listing = async (req, res, next) => {
  try {
    const likes = await Like.find({ comment: req.params.commentId })
      .populate({
        path: "user",
        populate: {
          path: "profile",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ likes });
  } catch (err) {
    return next(err);
  }
};

/* Get post like listing */
exports.post_like_listing = async (req, res, next) => {
  try {
    const likes = await Like.find({ post: req.params.postId })
      .populate({
        path: "user",
        populate: {
          path: "profile",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ likes });
  } catch (err) {
    return next(err);
  }
};

/* POST like. */
exports.like_create = async (req, res, next) => {
  const like = new Like({
    user: req.user._id,
    createdAt: new Date(),
  });
  if (req.params.postId && !req.params.commentId) {
    like.post = req.params.postId;
  } else if (req.params.commentId) {
    like.post = req.params.commentId;
  }
  try {
    await like.save();
    res.status(200).json({ message: "Like created" });
  } catch (err) {
    return next(err);
  }
};

/* DELETE like. */
exports.like_delete = async (req, res, next) => {
  try {
    if (req.params.postId && !req.params.commentId) {
      const likeDeleteResult = await Like.deleteOne({
        $and: [{ post: req.params.postId }, { user: req.user._id }],
      });
      if (likeDeleteResult.deletedCount === 0) {
        return res.status(404).json({ message: "Like not found" });
      }
      return res.status(200).json({ message: "Like deleted" });
    } else if (req.params.commentId) {
      const likeDeleteResult = await Like.deleteOne({
        $and: [{ comment: req.params.commentId }, { user: req.user._id }],
      });
      if (likeDeleteResult.deletedCount === 0) {
        return res.status(404).json({ message: "Like not found" });
      }
      return res.status(200).json({ message: "Like deleted" });
    }
  } catch (err) {
    next(err);
  }
};
