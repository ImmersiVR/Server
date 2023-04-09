const jwt = require("jsonwebtoken");
const JWT_SECRET = "wrejr438rhuesjklews";
const mongoose = require("mongoose");
const User = mongoose.model("User");
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "You must be logged in" });
  }
  //authorization === Bearer iweruskdcshfhsh(token)
  const token = authorization.replace("Bearer ", ""); //deleting the Bearer part to check the token
  // console.log(authorization);
  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You must be logged in" });
    }
    const { _id } = payload;
    User.findById(_id).then((userData) => {
      req.user = userData;
      next(); //to continue further and stop this middleware ..its put here so req only goes next with userdata and not otherwise
    });
  });
};
