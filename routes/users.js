var express = require("express");
var router = express.Router();
const passport = require("passport");

const { isAdmin, isUser } = require("./authMiddleware");

const user_controller = require("../controllers/userController");
const friend_controller = require("../controllers/friendController");
const post_controller = require("../controllers/postController");

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
  friend_controller.friend_listing
);

/* GET posts listing. */
router.get(
  "/:userId/posts",
  passport.authenticate("jwt", { session: false }),
  post_controller.post_listing
);

/* GET users details. */
router.get(
  "/:userId",
  passport.authenticate("jwt", { session: false }),
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

/* PUT user's profile picture. */
router.put(
  "/:userId/picture",
  passport.authenticate("jwt", { session: false }),
  isUser,
  user_controller.user_profilePicture_update
);

/* PUT user's profile work */
router.put(
  "/:userId/work",
  passport.authenticate("jwt", { session: false }),
  isUser,
  user_controller.user_profile_work_update
);

/* PUT user's profile education */
router.put(
  "/:userId/education",
  passport.authenticate("jwt", { session: false }),
  isUser,
  user_controller.user_profile_education_update
);

/* PUT user's profile city */
router.put(
  "/:userId/city",
  passport.authenticate("jwt", { session: false }),
  isUser,
  user_controller.user_profile_city_update
);

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
