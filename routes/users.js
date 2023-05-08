var express = require("express");
var router = express.Router();
const passport = require("passport");

const { isAdmin, isUser } = require("./authMiddleware");

const user_controller = require("../controllers/userController");
const friend_controller = require("../controllers/friendController");

/* GET user's friending suggest. */
router.get(
  "/:userId/friends/suggestion",
  passport.authenticate("jwt", { session: false }),
  isUser,
  friend_controller.friend_suggestion
);

/* GET user's friend listing. */
router.get(
  "/:userId/friends",
  passport.authenticate("jwt", { session: false }),
  isUser,
  friend_controller.friend_listing
);

/* GET users details. */
router.get(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  isUser,
  user_controller.user_details
);

/* GET all users listing. */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  user_controller.user_listing
);

/* POST users. */
router.post("/", user_controller.user_create);

/* PUT user's profile. */
router.put(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  isUser,
  user_controller.user_profile_update
);

/* DELETE user's friend. */
router.delete(
  "/:userId/friends/:friendId",
  passport.authenticate("jwt", { session: false }),
  isUser,
  friend_controller.friend_remove
);

/* DELETE users. */
router.delete(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  isUser,
  user_controller.user_delete
);

module.exports = router;
