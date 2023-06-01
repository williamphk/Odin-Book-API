var express = require("express");
const passport = require("passport");
require("dotenv").config();
const jwt = require("jsonwebtoken");

var router = express.Router();

const login_controller = require("../controllers/loginController");

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
  }),
  login_controller.facebook_login
);

router.get("/check", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "token is not found" });
  }

  jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
    if (err) {
      // token is invalid
      return res.status(401).json({ message: "token is not valid" });
    } else {
      // token is valid
      return res.status(200).json({ isAuthenticated: true });
    }
  });
});

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

/* POST JWT login */
router.post("/", login_controller.jwt_login);

module.exports = router;
