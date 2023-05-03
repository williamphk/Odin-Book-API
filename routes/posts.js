var express = require("express");
var router = express.Router();
const passport = require("passport");

const {
  isPostUser,
  isPostUserAndUserFriends,
  isCommentUser,
  isLikeUser,
} = require("./authMiddleware");

const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");
const like_conroller = require("../controllers/likeController");

/* GET posts newsfeed listing. */
router.get(
  "/newsfeed",
  passport.authenticate("jwt", { session: false }),
  post_controller.post_newsfeed_listing
);

/* GET comment details. */
router.get(
  "/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  isPostUserAndUserFriends,
  comment_controller.comment_details
);

/* GET comment listing. */
router.get(
  "/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  isPostUserAndUserFriends,
  comment_controller.comment_listing
);

/* GET posts details. */
router.get(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  isPostUserAndUserFriends,
  post_controller.post_details
);

/* GET posts listing. */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  post_controller.post_listing
);

/* POST comment likes. */
router.get(
  "/:postId/comments/:commentId/likes",
  passport.authenticate("jwt", { session: false }),
  isPostUserAndUserFriends,
  like_conroller.like_create
);

/* POST comments. */
router.post(
  "/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  isPostUserAndUserFriends,
  comment_controller.comment_create
);

/* POST post likes. */
router.post(
  "/:postId/likes",
  passport.authenticate("jwt", { session: false }),
  isPostUserAndUserFriends,
  like_conroller.like_create
);

/* POST posts. */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  post_controller.post_create
);

/* PUT comments. */
router.put(
  "/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  isCommentUser,
  comment_controller.comment_update
);

/* PUT posts. */
router.put(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  isPostUser,
  post_controller.post_update
);

/* DELETE comment likes. */
router.delete(
  "/:postId/comments/:commentId/likes/:likeId",
  passport.authenticate("jwt", { session: false }),
  isLikeUser,
  like_conroller.like_delete
);

/* DELETE comments. */
router.delete(
  "/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  isCommentUser,
  comment_controller.comment_delete
);

/* DELETE post likes. */
router.post(
  "/:postId/likes/:likeId",
  passport.authenticate("jwt", { session: false }),
  isLikeUser,
  like_conroller.like_delete
);

/* DELETE posts. */
router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  isPostUser,
  post_controller.post_delete
);

module.exports = router;
