var express = require("express");
const passport = require("passport");
require("dotenv").config();

var router = express.Router();

const login_controller = require("../controllers/loginController");

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
  }),
  login_controller.facebook_login
);

router.get("/check", login_controller.token_check);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

/* POST JWT login */
router.post("/", login_controller.jwt_login);

module.exports = router;
