const User = require("../models/user");

const { body, validationResult } = require("express-validator");
var bcrypt = require("bcryptjs");

/* GET user with id. */
exports.user_details = async (req, res, next) => {
  try {
    const user = User.findById(req.params.id, "firstName lastName email");
    res.json({ user });
  } catch (err) {
    return next(err);
  }
};

/* GET users listing. */
exports.user_listing = async (req, res, next) => {
  try {
    const users = await User.find({}, "first_name last_name email").sort({
      first_name: 1,
    });
    res.json({ users });
  } catch (err) {
    return next(err);
  }
};

exports.user_create = [
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
    });

    if (!errors.isEmpty()) {
      return res.status(401).json({ user, errors: errors.array() });
    }
    bcrypt.hash(user.password, 10, async (err, hashedPassword) => {
      user.password = hashedPassword;
      try {
        await user.save();
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
