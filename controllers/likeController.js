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
  const { postId, commentId } = req.params;
  const { _id: userId } = req.user;

  console.log(postId);

  // Check for existing like
  const existingLike = await Like.findOne({
    user: userId,
    // either find by comment or post
    ...(commentId ? { comment: commentId } : { post: postId }),
  });

  if (existingLike) {
    return res.status(400).json({ message: "Like already exists" });
  }

  // Create a new like
  const like = new Like({
    user: userId,
    ...(commentId ? { comment: commentId } : { post: postId }),
    createdAt: new Date(),
  });

  try {
    await like.save();
    return res.status(200).json({ message: "Like created" });
  } catch (err) {
    return next(err);
  }
};

/* DELETE like. */
exports.like_delete = async (req, res, next) => {
  try {
    const likeDeleteResult = await Like.deleteOne(
      { _id: req.params.likeId },
      { user: req.user._id }
    );
    if (likeDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Like not found" });
    }
    return res.status(200).json({ message: "Like deleted" });
  } catch (err) {
    next(err);
  }
};
