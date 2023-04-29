const mongoose = require("mongoose");

const { User } = require("../models/user");

/* GET user's friending suggest based on common friends. */
exports.friend_suggestion = async (req, res, next) => {
  try {
    const userId = mongoose.Types.ObjectId(req.params.userId);

    const friendSuggestions = await User.aggregate([
      { $match: { _id: { $ne: userId }, friends: { $ne: userId } } },
      {
        $lookup: {
          from: "users",
          localField: "friends",
          foreignField: "_id",
          as: "common_friends",
        },
      },
      {
        $match: {
          common_friends: {
            $elemMatch: {
              friends: userId,
            },
          },
        },
      },
      { $project: { password: 0 } },
    ]);

    return res.status(200).json({ friendSuggestions });
  } catch (err) {
    next(err);
  }
};

/* GET user's friend listing. */
exports.friend_listing = async (req, res, next) => {
  try {
    const friends = await User.find({ friends: req.params.userId });
    return res.status(200).json({ friends });
  } catch (err) {
    next(err);
  }
};

/* DELETE user friend remove. */
exports.friend_remove = async (req, res, next) => {
  try {
    await User.updateOne(
      { _id: req.params.userId },
      { $pull: { friends: req.params.friendId } }
    );
    await User.updateOne(
      { _id: req.params.userId },
      { $pull: { friends: req.params.userId } }
    );
    return res.status(200).json({ message: "friend removed" });
  } catch (err) {
    return next(err);
  }
};