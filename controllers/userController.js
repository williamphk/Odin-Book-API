const { validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { User, Profile } = require("../models/user");
const FriendRequest = require("../models/friendRequest");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");

const {
  nameValidationRules,
  emailValidationRules,
  createPasswordValidationRules,
  confirmPasswordValidationRules,
  genderValidationRules,
  birthdayValidationRules,
  oldPasswordValidationRules,
  introValidationRules,
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

const uploadDir = path.join(process.cwd(), "uploads");

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // accept only jpg, jpeg, png files
    const fileTypes = /jpeg|jpg|png/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }

    cb(
      new Error(
        "Error: File upload only supports the following filetypes - " +
          fileTypes
      )
    );
  },
});

/* GET users details. */
exports.user_details = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("profile", "-gender -birthday -friends")
      .select("-password -email");
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

    const { email, password } = req.body;

    const user = new User({
      email: email,
      password: password,
    });

    const profile = new Profile({
      firstName: toTitleCase(req.body.firstName),
      lastName: toTitleCase(req.body.lastName),
      gender: req.body.gender,
      birthday: req.body.birthday,
    });

    if (!errors.isEmpty()) {
      return res.status(400).json({ user, profile, errors: errors.array() });
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

        // Log the user in
        const secret = `${process.env.JWT_SECRET}`;
        const token = jwt.sign({ email }, secret, { expiresIn: "14d" });
        const userResponse = {
          _id: user._id,
          email: user.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          fullName: profile.fullName,
          picture: profile.picture,
        };
        return res.status(200).json({
          message: "User created & login successful",
          token,
          userResponse,
        });
      } catch (err) {
        return next(err);
      }
    });
  },
];

/* PUT user profile picture with id. */
exports.user_profilePicture_update = [
  upload.single("profile_picture"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      const profile = await Profile.findOne({ user: req.params.userId });
      if (profile.picture !== "default") {
        fs.unlink(
          path.join(__dirname, "..", "uploads", profile.picture),
          (err) => {
            if (err) {
              console.error("Failed to delete old profile picture:", err);
            }
          }
        );
      }

      const updatedProfile = await Profile.updateOne(
        { user: req.params.userId },
        { $set: { picture: req.file.filename } }
      );
      if (updatedProfile.modifiedCount === 0) {
        throw new Error("Profile picture update failed");
      }

      return res.status(200).json({
        message: "Profile picture updated successfully",
        picture: req.file.filename,
      });
    } catch (err) {
      return next(err);
    }
  },
];

/* PUT user profile work with id */
exports.user_profile_work_update = [
  ...introValidationRules("work"),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await Profile.updateOne(
        { user: req.params.userId },
        { $set: { work: req.body.work } }
      );
      return res.status(200).json({ message: "Work Updated" });
    } catch (err) {
      return next(err);
    }
  },
];

/* PUT user profile education with id */
exports.user_profile_education_update = [
  ...introValidationRules("education"),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await Profile.updateOne(
        { user: req.params.userId },
        { $set: { education: req.body.education } }
      );
      return res.status(200).json({ message: "Education Updated" });
    } catch (err) {
      return next(err);
    }
  },
];

/* PUT user profile education with id */
exports.user_profile_city_update = [
  ...introValidationRules("city"),
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      await Profile.updateOne(
        { user: req.params.userId },
        { $set: { city: req.body.city } }
      );
      return res.status(200).json({ message: "City Updated" });
    } catch (err) {
      return next(err);
    }
  },
];

/* PUT user profile with id. */
exports.user_profile_update = [
  ...userProfileUpdateValidationRules,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
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
    const { userId } = req.params;
    const profile = await Profile.findOne({ user: userId });

    if (userId === "644c12fc98784536ae313e1f") {
      return res.status(401).json({ message: "Cannot delete this user" });
    }

    const [userPosts, userComments] = await Promise.all([
      Post.find({ user: userId }),
      Comment.find({ user: userId }),
    ]);

    const userPostsIds = userPosts.map((element) => element._id);
    const userCommentsIds = userComments.map((element) => element._id);

    const userPostsComments = await Comment.find({
      post: { $in: userPostsIds },
    });

    const userPostsCommentsIds = userPostsComments.map(
      (element) => element._id
    );

    const [userDeleteResult, userProfileDeleteResult] = await Promise.all([
      // Delete User
      User.deleteOne({ _id: userId }),

      // Delete User's profile
      Profile.deleteOne({ user: userId }),
    ]);

    if (userDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "User not deleted" });
    }

    if (userProfileDeleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Profile not deleted" });
    }

    if (profile.picture !== "default") {
      fs.unlink(
        path.join(__dirname, "..", "uploads", profile.picture),
        (err) => {
          if (err) {
            console.error("Failed to delete old profile picture:", err);
          }
        }
      );
    }

    await Promise.all([
      // Delete User's friend requests if any
      FriendRequest.deleteMany({
        $or: [{ sender: userId }, { receiver: userId }],
      }),

      // Update User's friends' friend lists
      User.updateMany({ friends: userId }, { $pull: { friends: userId } }),

      // Delete User's posts
      Post.deleteMany({ user: userId }),

      // Delete User's likes
      Like.deleteMany({ user: userId }),

      // Delete User's comments
      Comment.deleteMany({ user: userId }),

      // Delete User's posts' likes
      Like.deleteMany({ post: { $in: userPostsIds } }),

      // Delete User's comments's likes
      Like.deleteMany({ comment: { $in: userCommentsIds } }),

      // Delete User's posts' comments
      Comment.deleteMany({ post: { $in: userPostsIds } }),

      // Delete User's post's comments's likes
      Like.deleteMany({ comment: { $in: userPostsCommentsIds } }),
    ]);

    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
