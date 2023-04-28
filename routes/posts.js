var express = require("express");
var router = express.Router();

const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");
const like_conroller = require("../controllers/likeController");

/* GET comment details. */
router.get("/:postId/comments/:commentId", comment_controller.comment_details);

/* GET comment listing. */
router.get("/:postId/comments", comment_controller.comment_listing);

/* GET posts details. */
router.get("/:postId", post_controller.post_details);

/* GET posts listing. */
router.get("/newsfeed", post_controller.post_newsfeed_listing);

/* GET posts listing. */
router.get("/", post_controller.post_listing);

/* POST comment likes. */
router.get(
  "/:postId/comments/:commentId/likes",
  comment_controller.comment_like_create
);

/* POST comments. */
router.post("/:postId/comments", comment_controller.comment_create);

/* POST post likes. */
router.post("/:postId/likes", like_conroller.like_create);

/* POST posts. */
router.post("/", post_controller.post_create);

/* PUT comments. */
router.put("/:postId/comments", comment_controller.comment_update);

/* PUT posts. */
router.put("/:postId", post_controller.post_update);

/* DELETE comment likes. */
router.delete(
  "/:postId/comments/:commentId/likes/:likeId",
  comment_controller.comment_like_delete
);

/* DELETE comments. */
router.delete("/:postId/comments", comment_controller.comment_delete);

/* DELETE post likes. */
router.post("/:postId/likes", like_conroller.like_delete);

/* DELETE posts. */
router.delete("/:postId", post_controller.post_delete);

module.exports = router;
