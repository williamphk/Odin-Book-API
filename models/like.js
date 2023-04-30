const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    validate: {
      validator: function () {
        // Ensure that either post or comment exists, but not both
        return (this.post && !this.comment) || (!this.post && this.comment);
      },
      message: "A like must have either a post or a comment, but not both",
    },
  }
);

module.exports = mongoose.model("Like", LikeSchema);
