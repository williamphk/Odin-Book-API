const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
require("dotenv").config();

const User = require("../models/user");

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = `${process.env.JWT_SECRET}`; //normally store this in process.env.secret

module.exports = new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    // Find the user with the email from the JWT payload
    const user = await User.findOne({
      email: jwt_payload.email,
    });
    // If a user with the provided email is found, consider the request authenticated
    if (user) {
      return done(null, user);
    }
    // If the user is not found, the authentication fails
    return done(null, false);
  } catch (err) {
    // If there's an error searching for the user, pass the error to the `done` function
    return done(err, false);
  }
});
