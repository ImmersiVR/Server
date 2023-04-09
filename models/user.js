const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  num: {
    type: String,
    required: true,
  },
  rewards: {
    type: Number,
    required: true,
  },
  pic: {
    type: String,
    default:
      "https://res.cloudinary.com/dwq3jyfgb/image/upload/v1670959375/quipwjncqogfjpld4na0.png",
  },
  resetToken: { type: String },
  expireToken: Date,
  followers: [{ type: ObjectId, ref: "User" }],
  following: [{ type: ObjectId, ref: "User" }],
});
mongoose.model("User", userSchema); //sometimes it gives error that since i have exported to a
