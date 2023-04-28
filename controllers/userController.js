const { User, Profile } = require("../models/user");

const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");

const { differenceInYears, parseISO } = require("date-fns");

// Custom validator for minimum age
const minAge = (minYears) => {
  return (value, { req }) => {
    const birthDate = parseISO(value);
    const age = differenceInYears(new Date(), birthDate);
    if (age < minYears) {
      throw new Error(`Minimum age is ${minYears} years`);
    }
    return true;
  };
};

// Convert names as "title case"
function toTitleCase(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Options for gender
const allowedGenders = ["male", "female", "others"];

/* GET user with id. */
exports.user_details = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.params.id,
      "email firstName lastName gender birthday friends avatar bio"
    ).populate("profile");
    res.json({ user });
  } catch (err) {
    return next(err);
  }
};

/* GET users listing. */
exports.user_listing = async (req, res, next) => {
  try {
    const users = await User.find({}, "fullName")
      .sort({
        createdAt: -1,
      })
      .populate("profile");
    res.json({ users });
  } catch (err) {
    return next(err);
  }
};

exports.user_create = [
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required")
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters")
    .isAlpha()
    .withMessage("First name must contain only alphabetic characters")
    .escape(),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required")
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters")
    .isAlpha()
    .withMessage("Last name must contain only alphabetic characters")
    .escape(),
  body("email")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Email is required")
    .isLength({ max: 254 })
    .withMessage("Email must be less than 254 characters")
    .normalizeEmail()
    .toLowerCase()
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) {
        // If a user with the provided email exists, throw an error
        throw new Error("Email already exists");
      }
      return true;
    })
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .isLength({ max: 128 })
    .withMessage("Password must be less than 128 characters")
    .matches(/[a-z]/, "g")
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "g")
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "g")
    .withMessage("Password must contain at least one digit")
    .matches(/[\W_]/, "g")
    .withMessage("Password must contain at least one special character"),
  body("confirmPassword")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Confirm password is required")
    .isLength({ max: 128 })
    .withMessage("Confirm password must be less than 128 characters")
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        // If the password do not match, throw an error
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  body("gender").custom((value) => {
    if (!allowedGenders.includes(value)) {
      throw new Error("Invalid gender value");
    }
    return true;
  }),
  body("birthday")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Birthday is required")
    .isISO8601()
    .withMessage("Invalid date format, expected YYYY-MM-DD")
    .custom(minAge(13))
    .escape(),

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
        res.status(200).json({ message: "User created" });
      } catch (err) {
        return next(err);
      }
    });
  },
];

/* PUT user with id. */
exports.user_update = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required")
    .escape(),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required")
    .escape(),
  body("email")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email: email });
      if (user) {
        // If a user with the provided email exists, throw an error
        throw new Error("Email already exists");
      }
      return true;
    })
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .escape(),
  body("confirm_password")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Confirm password is required")
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        // If the password do not match, throw an error
        throw new Error("Passwords do not match");
      }
      return true;
    })
    .escape(),
  async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.json({ user, errors: errors.array() });
      return next(errors);
    }
    bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
      user.password = hashedPassword;
      try {
        await User.updateOne({ _id: req.params.id }, user);
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
    const user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(401).json({ message: "User not found" });
    }
    await User.deleteOne({ _id: req.params.id });
    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
