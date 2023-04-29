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

/* PUT user profile with id. */
exports.user_profile_update = [
  ...userProfileUpdateValidationRules,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    bcrypt.hash(req.body.newPassword, 10, async (err, hashedPassword) => {
      try {
        await User.updateOne(
          { _id: req.params.userId },
          { $set: { email: req.body.email, password: hashedPassword } }
        );
        await Profile.updateOne(
          { user: req.params.userId },
          { $set: { gender: req.body.gender } }
        );
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
    const profile = await Profile.findOne({ user: req.params.userId });
    if (profile == null) {
      return res.status(404).json({ message: "Profile not found" });
    }
    const friendRequests = await FriendRequest.find({
      $or: [{ sender: req.params.userId }, { receiver: req.params.userId }],
    });
    await User.deleteOne({ _id: req.params.userId });
    await Profile.deleteOne({ user: req.params.userId });
    if (friendRequests) {
      FriendRequest.deleteMany({
        $or: [{ sender: req.params.userId }, { receiver: req.params.userId }],
      });
    }
    // Update User's friends' friend lists
    await User.updateMany(
      { friends: req.params.userId },
      { $pull: { friends: req.params.userId } }
    );
    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
