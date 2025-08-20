const express = require('express');
const router = express.Router();
const Lesson = require('../models/lesson');
const upload = require("../middlewares/uploads");
const sequelize = require('../config/db');
const UserLessons = require("../models/UserLessons");
const User = require("../models/user");

router.get("/users/:userId/lessons-status", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: {
        model: Lesson,
        as: "lessons",
        through: { attributes: ["isLocked"] }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "الطالب غير موجود" });
    }

    const lessonsWithStatus = user.lessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      images: lesson.images,
      pdfUrl: lesson.pdfUrl,
      createdAt: lesson.createdAt,
      isLocked: lesson.UserLessons.isLocked 
    }));

    res.status(200).json({
      unlockedLessons: lessonsWithStatus
    });
  } catch (err) {
    console.error("❌ Error fetching user lessons status:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.patch("/lessons/unlock-all", async (req, res) => {
  try {
    const [updatedCount] = await UserLessons.update(
      { isLocked: false },     
      { where: {} }            
    );

    res.status(200).json({
      message: `✅ تم فتح ${updatedCount} محاضرة لجميع الطلاب بنجاح.`
    });
  } catch (err) {
    console.error("❌ خطأ أثناء فتح جميع المحاضرات:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/users/:userId/lessons", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: {
        model: Lesson,
        as: "lessons",
        through: { attributes: ["isLocked"] }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "الطالب غير موجود" });
    }

    res.status(200).json(user.lessons);
  } catch (err) {
    console.error("❌ Error fetching user lessons:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/lessons/:lessonId/lock-user/:userId", async (req, res) => {
  try {
    const { lessonId, userId } = req.params;
    const { isLocked } = req.body;

    if (typeof isLocked !== "boolean") {
      return res.status(400).json({ error: "قيمة isLocked يجب أن تكون true أو false" });
    }

    const user = await User.findByPk(userId);
    const lesson = await Lesson.findByPk(lessonId);

    if (!user || !lesson) {
      return res.status(404).json({ error: "الطالب أو المحاضرة غير موجود" });
    }

    const [userLesson, created] = await UserLessons.findOrCreate({
      where: { userId, lessonId },
      defaults: { isLocked }
    });

    if (!created) {
      userLesson.isLocked = isLocked;
      await userLesson.save();
    }

    res.status(200).json({
      message: `تم ${isLocked ? "قفل" : "فتح"} المحاضرة للطالب بنجاح`,
      userLesson
    });
  } catch (err) {
    console.error("❌ Error locking lesson for user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch('/lessons/migrate-videoUrl-to-text', async (req, res) => {
  try {
    await sequelize.query(
      `ALTER TABLE Lessons MODIFY COLUMN videoUrl TEXT`
    );

    res.status(200).json({ message: '✅ تم تحديث عمود videoUrl إلى TEXT بنجاح.' });
  } catch (err) {
    console.error('❌ خطأ في تحديث عمود videoUrl:', err);
    res.status(500).json({ error: 'فشل في تحديث العمود', details: err.message });
  }
});

router.patch("/lessons/update-lock-field", async (req, res) => {
  try {
    const [updatedCount] = await Lesson.update(
      { isLocked: false },
      {
        where: {
          isLocked: null
        }
      }
    );

    res.status(200).json({
      message: `✅ تم تحديث ${updatedCount} درس وإضافة حقل isLocked = false.`,
    });
  } catch (err) {
    console.error("❌ خطأ أثناء تحديث الدروس:", err);
    res.status(500).json({
      message: "❌ حدث خطأ أثناء تحديث الدروس",
      error: err.message,
    });
  }
});

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
    
    const users = await User.findAll();
    for (const user of users) {
      await UserLessons.create({
        userId: user.id,
        lessonId: lesson.id,
        isLocked: false 
      });
    }

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

router.patch("/lessons/:id/lock", async (req, res) => {
  try {
    const { id } = req.params;
    const { isLocked } = req.body;

    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ error: "قيمة isLocked يجب أن تكون true أو false" });
    }

    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({ error: "الدرس غير موجود" });
    }

    lesson.isLocked = isLocked;
    await lesson.save();

    res.status(200).json({ message: `تم ${isLocked ? "قفل" : "فتح"} الدرس بنجاح`, lesson });
  } catch (err) {
    console.error("❌ Error updating lesson lock:", err);
    res.status(500).json({ error: "خطأ في الخادم الداخلي" });
  }
});

router.patch("/lessons/update-lock-field", async (req, res) => {
  const [updatedCount] = await Lesson.update(
    { isLocked: false },
    { where: { isLocked: null } }
  );
});


module.exports = router;
