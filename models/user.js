const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  facebookId: { type: String, unique: true, sparse: true },
  profile: { type: Schema.Types.ObjectId, ref: "Profile" },
  createdAt: { type: Date, default: Date.now },
});

const ProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String },
  birthday: { type: Date },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  picture: { type: String },
});

//Virtual for user's fullname
ProfileSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", UserSchema);
const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = {
  User,
  Profile,
};
