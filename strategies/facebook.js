const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();

const { User, Profile } = require("../models/user");

const facebookOptions = {
  clientID: `${process.env.FB_APP_ID}`,
  clientSecret: `${process.env.FB_APP_SECRET}`,
  callbackURL:
    "https://odin-book-api.azurewebsites.net/login/facebook/callback",
  profileFields: ["id", "email", "first_name", "last_name", "picture"],
};

// Configure Facebook strategy
module.exports = new FacebookStrategy(facebookOptions, async function (
  accessToken,
  refreshToken,
  fbProfile,
  done
) {
  try {
    //console.log(fbProfile._json.picture.data.url);
    // Find or create user based on Facebook profile
    const existingUser = await User.findOne({ facebookId: fbProfile._json.id });

    if (existingUser) {
      return done(null, existingUser);
    }

    const user = new User({
      facebookId: fbProfile._json.id,
      email: fbProfile._json.email,
    });

    const profile = new Profile({
      firstName: fbProfile._json.first_name,
      lastName: fbProfile._json.last_name,
      picture: fbProfile._json.picture.data.url,
    });

    await user.save();
    await profile.save();

    console.log(user._id);
    console.log(profile._id);

    // Update the user with the profile's _id
    await User.updateOne({ _id: user._id }, { $set: { profile: profile._id } });

    // Update the profile with the user's _id
    await Profile.updateOne({ _id: profile._id }, { $set: { user: user._id } });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});
