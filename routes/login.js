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

router.get("/check", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ isAuthenticated: false });
  }

  jwt.verify(token, YOUR_SECRET_KEY, (err, decoded) => {
    if (err) {
      // token is invalid
      return res.json({ isAuthenticated: false });
    } else {
      // token is valid
      return res.json({ isAuthenticated: true });
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
