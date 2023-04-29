const { body } = require("express-validator");
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

// Options for gender
const allowedGenders = ["male", "female", "others"];

exports.nameValidationRules = (key, displayName) => [
  body(key)
    .trim()
    .notEmpty()
    .withMessage(`${displayName} is required`)
    .isLength({ max: 50 })
    .withMessage(`${displayName} must be less than 50 characters`)
    .isAlpha()
    .withMessage(`${displayName} must contain only alphabetic characters`)
    .escape(),
];

exports.emailValidationRules = (key) => [
  body(key)
    .trim()
    .notEmpty()
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
];

exports.createPasswordValidationRules = (key) => [
  body(key)
    .trim()
    .notEmpty()
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
];

exports.confirmPasswordValidationRules = (key) => [
  body(key)
    .trim()
    .notEmpty()
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
];

exports.genderValidationRules = (key) => [
  body(key).custom((value) => {
    if (!allowedGenders.includes(value)) {
      throw new Error("Invalid gender value");
    }
    return true;
  }),
];

exports.birthdayValidationRules = (key) => [
  body(key)
    .trim()
    .notEmpty()
    .withMessage("Birthday is required")
    .isISO8601()
    .withMessage("Invalid date format, expected YYYY-MM-DD")
    .custom(minAge(13))
    .escape(),
];

exports.oldPasswordValidationRules = (key) => [
  body(key)
    .notEmpty()
    .withMessage("Old password is required")
    .isLength({ max: 128 })
    .withMessage("Password must be less than 128 characters")
    .custom(async (oldPassword, { req }) => {
      const user = await User.findById(req.user._id);
      // Compare the old password with the stored password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new Error("Invalid old password");
      }
      return true;
    }),
];
