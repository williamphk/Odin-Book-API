var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

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

//passport configuration
const passport = require("passport");
const jwtStrategry = require("./strategies/jwt");
const facebookStrategry = require("./strategies/facebook");
passport.use(jwtStrategry);
passport.use(facebookStrategry);

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/users", usersRouter);
app.use("/friend-requests", friendRequestRouter);
app.use("/posts", postRouter);

module.exports = app;
