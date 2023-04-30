const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendRequsetSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", require: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", require: true },
  status: {
    type: String,
    enum: ["accepted", "rejected", "pending"],
    require: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const FriendRequest = mongoose.model("FriendRequest", friendRequsetSchema);

module.exports = FriendRequest;
