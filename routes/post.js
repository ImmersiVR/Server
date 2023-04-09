const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const Post = mongoose.model("Post");
const axios = require("axios");
var sid = "ACd6e25c4544825090da4e748494c22df4";
var auth_token = "eae457fbb9b3946ee0e89dc73c4074c8";
var twilio = require("twilio")(sid, auth_token);
const User = mongoose.model("User");

// const User=mongoose.model.("User")
router.get("/allposts", requireLogin, (req, res) => {
  Post.find()
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts: posts });
    })
    .catch((err) => {
      console.log(err);
    }); //createdAt gets automatically added because of timestamp,- fro decending
});
router.get("/getsubpost", requireLogin, (req, res) => {
  // if postedBy is in my following then only consider
  Post.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/createpost", requireLogin, (req, res) => {
  const { title, body, pic } = req.body;
  var rew = 0;
  console.log(req.body);
  // console.log(title, body, pic);
  if (!title || !body || !pic) {
    return res.status(422).json({ error: "please add all the feilds" });
  }
  //   res.send("ok");
  User.findOne({ _id: req.user })
    .select("rewards")
    .then((user) => {
      rew = user.rewards;
      User.findByIdAndUpdate(
        req.user._id,
        { $set: { rewards: rew + 100 } },
        { new: true },
        (err, result) => {
          console.log("hi");
          if (err) {
            return res.status(422).json({ error: "reward can't be updated" });
          }
        }
      );
    });

  const post = new Post({
    title: title,
    body: body,
    photo: pic,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      res.json({ post: result, rewards: rew + 100 });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.get("/mypost", requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((mypost) => {
      res.json({ mypost: mypost });
    })
    .catch((err) => {
      console.log(err);
    });
});
router.put("/like", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    });
});
router.put("/unlike", requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    });
});

router.put("/comment", requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});
router.delete("/deletepost/:postId", requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});

router.post("/getDrone", async (req, res) => {
  axios(`http://localhost:8080/sites/location`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  }).then((res) => {
    console.log(res.data);

    ////////////////////
  });

  res.json({ me: `done` });
});
router.post("/getDronePosts", async (req, res) => {
  const { temp } = req.body;
  let my_posts = "";
  await axios(`http://localhost:8080/sites/getAll/${temp}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  }).then((res) => {
    my_posts = res.data;
  });
  console.log(my_posts);
  res.json({ me: my_posts });
});

router.post("/deleteDrone", async (req, res) => {
  const { temp } = req.body; //email
  axios(`http://localhost:8080/sites/${temp}/${"user1374"}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
  }).then((res) => {
    console.log(res.data);
  });
  console.log(temp, req.user);
  res.json({ me: `done` });
});

router.post("/sendSms", async (req, res) => {
  const { name, num, role, loc, percentage } = req.body;
  twilio.messages
    .create({
      from: "+19853153116",
      to: "+919644447030",
      body: `Hotspot ${loc}\n with garbage score:${percentage}% has been cleaned by ${role} ${name}\n Mobile No:${num}`,
    })
    .then(function (res) {
      console.log("message has sent!");
    })
    .catch(function (err) {
      console.log(err);
    });

  res.json({ me: `done` });
});
module.exports = router;
