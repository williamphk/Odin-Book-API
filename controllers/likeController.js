const Like = require("../models/like");

/* POST post like. */
exports.like_create = async (req, res, next) => {
  const like = new Like({
    user: req.user._id,
    createdAt: new Date(),
  });
  if (req.params.postId && !req.params.commentId) {
    like.post = req.params.postId;
  }
  if (req.params.commentId && !req.params.postId) {
    like.post = req.params.commentId;
  }
  try {
    await like.save();
    res.status(200).json({ message: "Like created" });
  } catch (err) {
    return next(err);
  }
};

/* DELETE post like. */
exports.like_delete = async (req, res, next) => {
  try {
    if (req.params.postId && !req.params.commentId) {
      const like = await Like.findOne({
        $and: [{ post: req.params.postId }, { user: req.user._id }],
      });
      if (like == null) {
        return res.status(404).json({ message: "Like not found" });
      }
      await Like.deleteOne({
        $and: [{ post: req.params.postId }, { user: req.user._id }],
      });
      return res.status(200).json({ message: "Like deleted" });
    }
    if (req.params.commentId && !req.params.postId) {
      const like = await Like.findOne({
        $and: [{ comment: req.params.commentId }, { user: req.user._id }],
      });
      if (like == null) {
        return res.status(404).json({ message: "Like not found" });
      }
      await Like.deleteOne({
        $and: [{ comment: req.params.commentId }, { user: req.user._id }],
      });
      return res.status(200).json({ message: "Like deleted" });
    }
  } catch (err) {
    next(err);
  }
};
