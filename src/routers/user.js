const express = require("express");
const Users = require("../models/users");
const auth = require("../midlware/auth");
const task = require("../models/tasks");
const sharp= require("sharp")

const router = new express.Router();

const multer = require("multer");  //to upload files
const upload = multer({
  limits: {
    fileSize: 1000000
},
fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload an image'))
    }

    cb(undefined, true)
}})
router.post("/user/me/avater",auth,upload.single("upload"), async (req, res) => {
    const buffer=await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
   req.user.avater= buffer
   await req.user.save()
    res.send("done");

  },
  (e, req, res, next) => {
    res.status(400).send({ error: e.message });
  }
);

router.post("/users", async (req, res) => {
  const user = new Users(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send("error");
  }
});
router.post("/login", async (req, res) => {
  try {
    const user = await Users.findbycradenials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send("error");
  }
});
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send("error");
  }
});
router.post("/logoutall", auth, async (req, res) => {
  try {
    req.user.tokens = [];

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(400).send("error");
  }
});

router.get("/users/me", auth,(req, res) => {
  res.send(req.user);
});
router.get("/users/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await Users.findById(_id);

    if (!user) {
      return res.status(400).send("no user with this id");
    }
    res.send(user);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowtoupdate = ["name", "email", "password", "age"];
  const isvalidoperation = updates.every((update) =>
    allowtoupdate.includes(update)
  );

  if (!isvalidoperation) {
    return res.status(400).send("error in update");
  }
  try {
    updates.forEach((element) => (req.user[element] = req.body[element]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});
router.delete("/users/me", auth, async (req, res) => {
  try {
    console.log(req.user)
     req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(401);
    res.send("can not delete"+e);
  }
});
router.delete("/users/me/avater", auth, async (req, res) => {
  try {
    req.user.avater=undefined
    req.user.save()
    
    res.send('done');
  } catch (e) {
    res.status(400);
    res.send("can not delete");
  }
});

router.get("/users/:id/avater", async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await Users.findById(_id);

    if (!user) {
      return res.status(400).send("no user with this id");
    }
    res.set('Content-Type','image/png')
    res.send(user.avater);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

module.exports = router;
