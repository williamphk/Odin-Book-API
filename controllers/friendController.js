const mongoose = require("mongoose");

const { User, Profile } = require("../models/user");

/* GET user's friending suggest based on common friends. */
exports.friend_suggestion = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.params.userId);

    const userWithCommonFriends = await User.aggregate([
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

    const userWithCommonFriendsIds = userWithCommonFriends.map(
      (element) => element._id
    );

    const otherUser = await User.find({
      $nor: [
        { _id: userId },
        { _id: { $in: userWithCommonFriendsIds } },
        { friends: userId },
      ],
    })
      .populate("profile", "-gender -birthday -friends")
      .select("-password -email");

    const friendSuggestion = [...userWithCommonFriends, ...otherUser];

    return res.status(200).json({ friendSuggestion });
  } catch (err) {
    next(err);
  }
};

/* GET user's friend listing. */
exports.friend_listing = async (req, res, next) => {
  try {
    const friends = await Profile.find({ friends: req.params.userId });
    return res.status(200).json({ friends });
  } catch (err) {
    next(err);
  }
};

/* DELETE user friend remove. */
exports.friend_remove = async (req, res, next) => {
  try {
    [userUpdateResult, userFriendsUpdateResult] = await Promise.all([
      Profile.updateOne(
        { user: req.params.userId },
        { $pull: { friends: req.params.friendId } }
      ),
      Profile.updateOne(
        { user: req.params.friendId },
        { $pull: { friends: req.params.userId } }
      ),
    ]);

    if (userUpdateResult.modifiedCount === 0) {
      return res.status(404).json({ message: "User not updated" });
    }

    if (userFriendsUpdateResult.modifiedCount === 0) {
      return res.status(404).json({ message: "User's friends not updated" });
    }

    return res.status(200).json({ message: "friend removed" });
  } catch (err) {
    return next(err);
  }
};
