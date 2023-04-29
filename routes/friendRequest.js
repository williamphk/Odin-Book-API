var express = require("express");
var router = express.Router();
const passport = require("passport");

const { isUserFriendRequest } = require("./authMiddleware");

const friendrequest_controller = require("../controllers/friendRequestController");

/* GET user's friend request. */
router.get(
  "/:friendRequestId",
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequest,
  friendrequest_controller.friendRequest_accept
);

/* GET user's friend request listing. */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequest,
  friendrequest_controller.friendRequest_listing
);

/* POST user friend request. */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequest,
  friendrequest_controller.friendRequest_create
);

/* PUT user accpeting friend request */
router.put("/:friendRequestId"),
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequest,
  friendrequest_controller.friendRequest_update;

/* DELETE user friend request. */
router.delete(
  "/:friendRequestId",
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequest,
  friendrequest_controller.friendRequest_delete
);

module.exports = router;
