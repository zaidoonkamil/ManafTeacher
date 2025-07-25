const express = require('express');
const router = express.Router();
const Course = require('../models/course');
const multer = require("multer");
const upload = multer();

router.post("/courses", upload.none(), async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const course = await Course.create({
      title,
      description,
      price
    });

    res.status(201).json(course);

  } catch (err) {
    console.error("❌ Error creating course:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(courses);
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;