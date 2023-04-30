const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();

const { User, Profile } = require("../models/user");

const facebookOptions = {
  clientID: `${process.env.FB_APP_ID}`,
  clientSecret: `${process.env.FB_APP_SECRET}`,
  callbackURL: "http://localhost:3000/login/facebook/callback",
  profileFields: [
    "id",
    "email",
    "first_name",
    "last_name",
    "picture",
    "gender",
    "birthday",
  ],
};

// Configure Facebook strategy
module.exports = new FacebookStrategy(facebookOptions, async function (
  accessToken,
  refreshToken,
  fbProfile,
  done
) {
  try {
    // Find or create user based on Facebook profile
    const existingUser = await User.findOne({ facebookId: fbProfile.id });

    if (existingUser) {
      return done(null, existingUser);
    }

    const user = new User({
      facebookId: fbProfile.id,
      email: fbProfile.emails[0].value,
      createdAt: new Date(),
    });

    const profile = new Profile({
      firstName: fbProfile.first_name,
      lastName: fbProfile.last_name,
      gender: fbProfile.gender,
      birthday: fbProfile.birthday,
      picture: fbProfile.picture,
    });

    await user.save();
    await profile.save();

    // Update the user with the profile's _id
    await User.updateOne({ _id: user._id }, { $set: { profile: profile._id } });

    // Update the profile with the user's _id
    await Profile.updateOne({ _id: profile._id }, { $set: { user: user._id } });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
