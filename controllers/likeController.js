const Like = require("../models/like");

/* POST post like. */
exports.like_create = async (req, res, next) => {
  const like = new Like({
    user: req.user._id,
    post: req.params.postId,
    createdAt: new Date(),
  });
  try {
    await like.save();
  } catch (err) {
    return next(err);
  }
};

/* DELETE post like. */
exports.like_delete = async (req, res, next) => {
  try {
    const like = await Like.findById(req.params.postId);
    if (like == null) {
      return res.status(401).json({ message: "Like not found" });
    }
    await Like.deleteMany({ post: req.params.postId });
    return res.status(200).json({ message: "Like deleted" });
  } catch (err) {
    next(err);
  }
};
