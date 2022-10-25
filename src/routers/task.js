const express = require("express");
const Tasks = require("../models/tasks");
const auth = require("../midlware/auth");

const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
  const task = new Tasks({ ...req.body, owner: req.user._id });

  await task
    .save()
    .then(() => {
      res.status(201);
      res.send(task);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
   //const tasks = await Tasks.findById(_id);
    const tasks = await Tasks.findOne({ _id, owner: req.user._id });

    if (!tasks) {
      return res.status(400).send(e);
    }
    res.send(tasks);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});
router.get("/tasks", auth, async (req, res) => {
  res.status(200).send("done")
});
//tasks?completed=true&title=name&sortBy=createdAt:desc&limt=3&skip=3
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const search = {};
  const sort = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  if (req.query.importance) {
    match.importance = req.query.importance
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
  }
  try {
    await req.user.populate({
      path: "tasks",
      match,
      search,
      options: {
        limit: parseInt(req.query.limit),

        skip: parseInt(req.query.skip),
        sort,
      },
    });
    const tasks = [];
    if (req.query.title) {
      req.user.tasks.forEach((task) => {
        if (task.title.includes(req.query.title)) {
         tasks.push({task});
        }
      });
      return res.send(tasks);
    }  
    res.send(req.user.tasks);
    
  } catch (e) {
    res.status(400);
    res.send("e");
  }
});
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowtoupdate = ["description", "completed"];
  const isvalidoperation = updates.every((update) =>
    allowtoupdate.includes(update)
  );

  if (!isvalidoperation) {
    return res.status(400).send("error in update");
  }
  const _id = req.params.id;

  try {
    const task = await Tasks.findOne({ _id, owner: req.user._id });
    updates.forEach((update) => (task[update] = req.body[update]));
    if (!task) {
      return res.status(400).send("error in update");
    }
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Tasks.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(400).send("no task with this id");
    }
    task.remove();

    res.send(task);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

module.exports = router;
