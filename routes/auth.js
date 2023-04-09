const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "wrejr438rhuesjklews";
const requireLogin = require("../middleware/requireLogin");
const nodemailer = require("nodemailer");
var sid = "ACd6e25c4544825090da4e748494c22df4";
var auth_token = "eae457fbb9b3946ee0e89dc73c4074c8";
var twilio = require("twilio")(sid, auth_token);
// const sendgridTransport = require("nodemailer-sendgrid-transport");
//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    second api
// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key:
//         "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",
//       // "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",
//     },
//   })
// );
let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "ro-reply.gmail.com",
  secure: false,
  auth: {
    user: "harshvardhan10052003@gmail.com",
    pass: "mvqorxzqwqzfcazy",
  },
});

router.get("/protected", requireLogin, (req, res) => {
  res.send("hello ");
});
router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/signup", (req, res) => {
  const { name, email, password, pic, role, num } = req.body;
  const rewards = 0;
  //   console.log(req.body);
  if (!email || !name || !password || !role) {
    return res.status(422).json({ error: "please send all feilds properly" }); //status is there to tell that server got the request but can't process it
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "user already exists with email" });
      }
      bcrypt.hash(password, 15).then((hashedpassword) => {
        const user = new User({
          name,
          email,
          password: hashedpassword,
          role,
          pic,
          num,
          rewards,
        });
        user
          .save()
          .then((user) => {
            // transporter.sendMail({
            //   to: user.email,
            //   from: "harshvardhan10052003@gmail.com",
            //   subject: "signup  success",
            //   html: "<h1>welcome to instagram</h1>",
            // });
            twilio.messages
              .create({
                from: "+19853153116",
                to: `+91${user.num}`,
                body: `your login credetials are:\n Email Id: ${user.email}\n Password: ${password}`,
              })
              .then(function (res) {
                console.log("message has sent!");
              })
              .catch(function (err) {
                console.log(err);
              });

            res.json({ message: "saved me successfully" });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .json({ error: "please send password and email properly" });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (!savedUser) {
        return res.status(422).json({ error: "Invalid email or password" });
      }
      bcrypt.compare(password, savedUser.password).then((domatch) => {
        if (domatch) {
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const {
            _id,
            name,
            email,
            followers,
            following,
            pic,
            role,
            num,
            rewards,
          } = savedUser;
          res.json({
            token,
            user: {
              _id,
              name,
              email,
              followers,
              following,
              pic,
              role,
              num,
              rewards,
            },
          });
        } else {
          return res.status(422).json({ error: "Invalid email or password" });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.post("/reset-password", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: "User dont exists with that email" });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      console.log(user.email);
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: "harshvardhan10052003@gmail.com",
          subject: "password reset",
          html: `
                  <p>You requested for password reset</p>
                  <h5>click in this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h5>
                  `,
        });
        res.json({ message: "check your email" });
      });
    });
  });
});
router.post("/new-password", (req, res) => {
  console.log(req.body.token);
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: "Try again session expired" });
      }
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({ message: "password updated success" });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
