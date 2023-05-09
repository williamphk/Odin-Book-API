var express = require("express");
const passport = require("passport");
require("dotenv").config();

var router = express.Router();

const login_controller = require("../controllers/loginController");

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  login_controller.facebook_login
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

/* POST JWT login */
router.post("/", login_controller.jwt_login);

module.exports = router;
