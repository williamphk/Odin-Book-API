const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
var bcrypt = require("bcryptjs");

require("dotenv").config();

exports.facebook_login = async (req, res) => {
  // Generate a JWT for the authenticated user
  const token = jwt.sign({ id: req.user.id }, `${process.env.SECRET}`, {
    expiresIn: "14d",
  });

  // Populate the Profile
  const user = await User.findById(req.user._id).populate("profile");

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Strict", // can be 'Lax' or 'None' if required
    secure: process.env.NODE_ENV !== "development", // set to true if in production (HTTPS), false otherwise
    maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
  });

  return res.redirect("http://localhost:3001/");
};

/* POST JWT login */
exports.jwt_login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Find the user with the provided username
    const user = await User.findOne({ email }).populate("profile");
    // If the user is not found, return with a message
    if (!user) {
      return res.status(401).json({ email: "Incorrect email" });
    }

    // Compare the provided password with the stored hashed password
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return next(err);
      }

      if (result) {
        // If the passwords match, log the user in
        const secret = `${process.env.JWT_SECRET}`;
        const token = jwt.sign({ email }, secret, { expiresIn: "14d" });
        const userResponse = {
          _id: user._id,
          email: user.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          fullName: user.profile.fullName,
          picture: user.profile.picture,
        };
        return res.status(200).json({
          message: "Login successful",
          token,
          userResponse,
        });
      } else {
        // If the passwords do not match, return with a message
        return res.status(401).json({ password: "Incorrect password" });
      }
    });
  } catch (err) {
    return next(err);
  }
};
