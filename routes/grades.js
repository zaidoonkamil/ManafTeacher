const express = require('express');
const router = express.Router();
const { User, Grade } = require('../models');
const multer = require("multer");
const upload = multer();
const { Op } = require('sequelize');

router.post('/grades', async (req, res) => {
  try {
    const parsedGrades = Array.isArray(req.body) ? req.body : [];

    if (parsedGrades.length === 0) {
      return res.status(400).json({ error: "قائمة الدرجات غير صحيحة أو فارغة" });
    }

    const results = [];

    for (const entry of parsedGrades) {
      const {
        userId,
        unitName = "Unit One",
        lectureNos = [],
        examGrades = [],
        originalGrades = [],
        resitGrades1 = [],
        resitGrades2 = []
      } = entry;

      if (!userId) continue;

      let grade = await Grade.findOne({ where: { userId, unitName } });

      if (grade) {
        grade.lectureNos = lectureNos;
        grade.examGrades = examGrades;
        grade.originalGrades = originalGrades;
        grade.resitGrades1 = resitGrades1;
        grade.resitGrades2 = resitGrades2;
        await grade.save();
        results.push({ userId, status: "✅ تم التحديث", grade });
      } else {
        const newGrade = await Grade.create({
          userId,
          unitName,
          lectureNos,
          examGrades,
          originalGrades,
          resitGrades1,
          resitGrades2
        });
        results.push({ userId, status: "✅ تمت الإضافة", grade: newGrade });
      }
    }

    return res.status(200).json({
      message: "✅ تم حفظ الدرجات بنجاح",
      results
    });

  } catch (error) {
    console.error("❌ خطأ:", error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب" });
  }
});

router.get('/grades', async (req, res) => {
  try {
      const studentsWithGrades = await User.findAll({
        attributes: ['id', 'name', 'phone'],
        where: { role: { [Op.ne]: 'admin' } },
        include: [
          {
            model: Grade,
            as: 'grade',
            attributes: [
              'unitName', 
              'lectureNos', 
              'examGrades', 
              'originalGrades', 
              'resitGrades1', 
              'resitGrades2'
            ],
          }
        ],
        order: [['id', 'ASC']]
      });


    res.json({ students: studentsWithGrades });
  } catch (error) {
    console.error("❌ خطأ في جلب الدرجات:", error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الدرجات' });
  }
});

router.get('/grades/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const studentWithGrade = await User.findOne({
      where: { id },
      attributes: ['id', 'name', 'phone'],  // أضفت phone عشان نفس التفاصيل مثل الراوت الأولى
      include: [
        {
          model: Grade,
          as: 'grade',
          attributes: [
            'unitName',
            'lectureNos',
            'examGrades',
            'originalGrades',
            'resitGrades1',
            'resitGrades2'
          ],
        }
      ]
    });

    if (!studentWithGrade) {
      return res.status(404).json({ error: 'الطالب غير موجود' });
    }

    res.json({ student: studentWithGrade });
  } catch (error) {
    console.error("❌ خطأ في جلب درجات الطالب:", error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب درجات الطالب' });
  }
});


module.exports = router;
