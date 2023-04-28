var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/userController");

/* GET users details. */
router.get("/:id", user_controller.user_details);

/* GET users listing. */
router.get("/", user_controller.user_listing);

/* POST users. */
router.post("/", user_controller.user_create);

/* PUT users. */
router.put("/:id", user_controller.user_update);

/* DELETE users. */
router.delete("/:id", user_controller.user_delete);

module.exports = router;
