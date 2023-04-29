const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const friendRequsetSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", require: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", require: true },
  createdAt: { type: Date, default: Date.now },
});
