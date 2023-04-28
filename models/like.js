const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  createdAt: { type: Date, default: Date.now },
});

const Like = mongoose.model("Like", LikeSchema);

module.exports = Like;
