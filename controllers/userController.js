const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

const { User, Profile } = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const {
  nameValidationRules,
  emailValidationRules,
  createPasswordValidationRules,
  confirmPasswordValidationRules,
  genderValidationRules,
  birthdayValidationRules,
  oldPasswordValidationRules,
} = require("./validationRules");

// Convert names as "title case"
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

const userCreateValidationRules = [
  ...nameValidationRules("firstName", "First name"),
  ...nameValidationRules("lastName", "Last name"),
  ...emailValidationRules("email"),
  ...createPasswordValidationRules("password"),
  ...confirmPasswordValidationRules("confirmPassword"),
  ...genderValidationRules("gender"),
  ...birthdayValidationRules("birthday"),
];
const userProfileUpdateValidationRules = [
  ...emailValidationRules("email"),
  ...oldPasswordValidationRules("oldPassword"),
  ...createPasswordValidationRules("newPassword"),
  ...confirmPasswordValidationRules("confirmNewPassword"),
  ...genderValidationRules("gender"),
];

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

/* GET users details. */
exports.user_details = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.params.userId,
      "email firstName lastName gender birthday friends avatar bio"
    ).populate("profile");
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
};

/* GET all users listing. */
exports.user_listing = async (req, res, next) => {
  try {
    const users = await User.find({}, "fullName")
      .sort({
        createdAt: -1,
      })
      .populate("profile");
    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
};

/* POST user. */
exports.user_create = [
  ...userCreateValidationRules,
  async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      email: req.body.email,
      password: req.body.password,
    });

    const profile = new Profile({
      firstName: toTitleCase(req.body.firstName),
      lastName: toTitleCase(req.body.lastName),
      gender: req.body.gender,
      birthday: req.body.birthday,
    });

    if (!errors.isEmpty()) {
      return res.status(401).json({ user, profile, errors: errors.array() });
    }
    bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
      user.password = hashedPassword;
      try {
        await user.save();
        await profile.save();

        // Update the user with the profile's _id
        await User.updateOne(
          { _id: user._id },
          { $set: { profile: profile._id } }
        );

        // Update the profile with the user's _id
        await Profile.updateOne(
          { _id: profile._id },
          { $set: { user: user._id } }
        );
        return res.status(200).json({ message: "User created" });
      } catch (err) {
        return next(err);
      }
    });
  },
];

/* PUT user friend remove. */
exports.friend_remove = async (req, res, next) => {
  try {
    const targetId = mongoose.Types.ObjectId(req.query.targetId);
    await User.updateOne(
      { _id: req.params.userId },
      { $pull: { friends: targetId } }
    );
    await User.updateOne(
      { _id: targetId },
      { $pull: { friends: req.params.userId } }
    );
    return res.status(200).json({ message: "friend removed" });
  } catch (err) {
    return next(err);
  }
};

/* PUT user profile with id. */

exports.user_profile_update = [
  ...userProfileUpdateValidationRules,
  async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      email: req.body.email,
      password: req.body.newPassword,
      _id: req.params.userId,
    });

    const profile = new Profile({
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      gender: req.body.gender,
      birthday: req.user.birthday,
      _id: req.user.profile,
    });

    if (!errors.isEmpty()) {
      return res.status(401).json({ user, profile, errors: errors.array() });
    }
    bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
      user.password = hashedPassword;
      try {
        await User.updateOne({ _id: req.params.userId }, user);
        await Profile.updateOne({ _id: req.body.profile }, profile);
        return res.status(200).json({ message: "User Updated" });
      } catch (err) {
        return next(err);
      }
    });
  },
];

/* DELETE user with id. */
exports.user_delete = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile = await Profile.findById(req.body.profile);
    if (profile == null) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const friendRequests = await FriendRequest.find({
      $or: [{ sender: req.params.userId }, { receiver: req.params.userId }],
    });
    await User.deleteOne({ _id: req.params.userId });
    await Profile.deleteOne({ _id: req.body.profile });
    if (friendRequests) {
      FriendRequest.deleteMany({
        $or: [{ sender: req.params.userId }, { receiver: req.params.userId }],
      });
    }
    // Update User's friend
    await User.updateMany(
      { friends: req.params.userId },
      { $pull: { friends: req.params.userId } }
    );
    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
