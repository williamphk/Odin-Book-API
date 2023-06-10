const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
var bcrypt = require("bcryptjs");
const appInsights = require("applicationinsights");

require("dotenv").config();

exports.facebook_login = async (req, res) => {
  // Generate a JWT for the authenticated user
  const token = jwt.sign({ id: req.user.id }, `${process.env.JWT_SECRET}`, {
    expiresIn: "14d",
  });

  // res.cookie("token", token, {
  //   httpOnly: true,
  //   sameSite: "none",
  //   secure: true,
  //   maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
  // });

  // appInsights.defaultClient.trackTrace({
  //   message: "User object: " + JSON.stringify(req.user),
  // });
  // appInsights.defaultClient.trackTrace({
  //   message: "Generated JWT token: " + token,
  // });

  // // Before the redirect
  // appInsights.defaultClient.trackTrace({
  //   message: "Response object: " + JSON.stringify(res),
  // });

  return res.redirect("https://williamphk.github.io/Odin-Book-frontend/?token=" + token);
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

/* GET JWT check */
exports.token_check = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "token is not found" });
    }

    jwt.verify(token, `${process.env.JWT_SECRET}`, async (err, decoded) => {
      if (err) {
        // token is invalid
        return res.status(401).json({ message: "token is not valid" });
      } else {
        // token is valid, now get the user using the id from the decoded token
        const user = await User.findById(decoded.id).populate("profile");
        const userResponse = {
          _id: user._id,
          email: user.email,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          fullName: user.profile.fullName,
          picture: user.profile.picture,
        };
        return res
          .status(200)
          .json({ isAuthenticated: true, token, userResponse });
      }
    });
  } catch (err) {
    return next(err);
  }
};
