var express = require("express");
var router = express.Router();
const passport = require("passport");

const {
  isUserFriendRequestReceiver,
  isUserFriendRequestSender,
} = require("./authMiddleware");

const friendrequest_controller = require("../controllers/friendRequestController");

/* GET user's friend request details. */
router.get(
  "/:friendRequestId",
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequestReceiver,
  friendrequest_controller.friendRequest_details
);

/* GET user's friend request listing. */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  friendrequest_controller.friendRequest_listing
);

/* POST user friend request. */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  friendrequest_controller.friendRequest_create
);

/* PUT user accpeting friend request */
router.put("/:friendRequestId/accept"),
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequestReceiver,
  friendrequest_controller.friendRequest_accept;

/* PUT user rejecting friend request */
router.put("/:friendRequestId/reject"),
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequestReceiver,
  friendrequest_controller.friendRequest_reject;

/* DELETE user friend request. */
router.delete(
  "/:friendRequestId",
  passport.authenticate("jwt", { session: false }),
  isUserFriendRequestSender,
  friendrequest_controller.friendRequest_delete
);

module.exports = router;
