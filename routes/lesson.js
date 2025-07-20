const express = require('express');
const router = express.Router();
const Lesson = require('../models/lesson');
const multer = require("multer");
const upload = multer();


router.post("/lessons", upload.none(), async (req, res) => {
  try {
    const { title, videoUrl, description, courseId, pdfUrl} = req.body;

    const lesson = await Lesson.create({
      title,
      videoUrl,
      description,
      courseId,
      pdfUrl: pdfUrl || null
    });

    res.status(201).json(lesson);
  } catch (err) {
    console.error("❌ Error creating lesson:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/lessons/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(lessons);
  } catch (err) {
    console.error("❌ Error fetching lessons:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
