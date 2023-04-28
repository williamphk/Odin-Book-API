const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profile: { type: Schema.Types.ObjectId, ref: "Profile" },
  createdAt: { type: Date, default: Date.now },
});

const ProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["male", "female", "others"], required: true },
  birthday: { type: Date },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  avatar: { type: String },
  bio: { type: String },
  createdAt: { type: Date, default: Date.now },
});

//Virtual for user's fullname
UserSchema.virtual("fullname").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", UserSchema);
const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = {
  User,
  Profile,
};
