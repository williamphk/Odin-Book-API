var express = require("express");
const passport = require("passport");

var router = express.Router();

/* POST logout */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
      sameSite: "Strict",
      secure: false,
    });

    return res.status(200).json({ message: "Logout successful" });
  }
);

module.exports = router;
