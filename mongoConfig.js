var mongoose = require("mongoose");

require("dotenv").config();

mongoose.connect(
  `mongodb+srv://inventory-admin:${process.env.MONGO_SECRET_KEY}@cluster0.ynqmqjk.mongodb.net/odin-book?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
