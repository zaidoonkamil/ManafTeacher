const express = require('express');
const router = express.Router();
const Lesson = require('../models/lesson');
const upload = require("../middlewares/uploads");


router.post("/lessons", upload.array("images", 5), async (req, res) => {
  try {
    const { title, videoUrl, description, courseId, pdfUrl} = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const images = req.files.map(file => file.filename);

    const lesson = await Lesson.create({
      title,
      videoUrl,
      images,
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

router.delete("/lessons/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ error: "الدرس غير موجود" });
    }

    await lesson.destroy();

    res.status(200).json({ message: "تم حذف الدرس بنجاح" });
  } catch (err) {
    console.error("❌ Error deleting lesson:", err);
    res.status(500).json({ error: "خطأ في الخادم الداخلي" });
  }
});


module.exports = router;
