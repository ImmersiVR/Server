const { default: mongoose } = require("mongoose");

const express = require("express");
const app = express();
const PORT = process.env.PORT || 5050;
const { MONGOURI } = require("./keys.js"); //"mongodb://localhost:27017/NITR"
mongoose
  .connect("mongodb://localhost:27017/SoftwareProject", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  });
require("./models/user");
require("./models/post");
app.use(express.json());
// mongoose.model("User");
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/user"));
if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
app.listen(PORT, () => {
  console.log("connected to port:", PORT);
});
//note since we are not adding a login for municipal then if u copy it somewhere then insert insert municipal yourself
