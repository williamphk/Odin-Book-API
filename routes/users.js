var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");
const friendrequest_controller = require("../controllers/friendRequestController");

/* GET users details. */
router.get("/:userId", user_controller.user_details);

/* GET users listing. */
router.get("/", user_controller.user_listing);

/* POST users. */
router.post(
  "/:receiverId/friend-request",
  friendrequest_controller.friendRequest_create
);

/* POST users. */
router.post("/", user_controller.user_create);

/* PUT users. */
router.put("/:userId", user_controller.user_update);

/* DELETE users. */
router.delete(
  "/:receiverId/friend-request",
  friendrequest_controller.friendRequest_delete
);

/* DELETE users. */
router.delete("/:userId", user_controller.user_delete);

module.exports = router;
