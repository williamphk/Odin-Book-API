var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
const session = require("express-session");

var indexRouter = require("./routes/index");
var loginRouter = require("./routes/login");
var usersRouter = require("./routes/users");
var friendRequestRouter = require("./routes/friendRequest");
var postRouter = require("./routes/posts");

require("./mongoConfig");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Express-session configuration
app.use(
  session({
    secret: "HELLO", // Replace 'your_secret_key' with your own secret key
    resave: false,
    saveUninitialized: false,
  })
);

// Passport configuration
const passport = require("passport");
const jwtStrategry = require("./strategies/jwt");
const facebookStrategry = require("./strategies/facebook");
passport.use(jwtStrategry);
passport.use(facebookStrategry);
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

// Enable CORS
app.use(cors());

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/friend-requests", friendRequestRouter);
app.use("/posts", postRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

module.exports = app;
