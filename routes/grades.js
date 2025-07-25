const express = require('express');
const router = express.Router();
const { User, Grade } = require('../models');
const multer = require("multer");
const upload = multer();

router.post('/grades', upload.none(), async (req, res) => {
  try {
    const gradesData = req.body.grades || [];

    if (!Array.isArray(gradesData) || gradesData.length === 0) {
      return res.status(400).json({ error: "قائمة الدرجات غير صحيحة أو فارغة" });
    }

    const cleanGrade = (value) => {
      return (value === undefined || value === null || value === "") ? 0 : value;
    };

    const results = [];

    for (const entry of gradesData) {
      const { userId, unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8 } = entry;

      if (!userId) continue;

      let grade = await Grade.findOne({ where: { userId } });

      if (grade) {
        grade.unit1 = (unit1 !== undefined && unit1 !== "") ? unit1 : grade.unit1;
        grade.unit2 = (unit2 !== undefined && unit2 !== "") ? unit2 : grade.unit2;
        grade.unit3 = (unit3 !== undefined && unit3 !== "") ? unit3 : grade.unit3;
        grade.unit4 = (unit4 !== undefined && unit4 !== "") ? unit4 : grade.unit4;
        grade.unit5 = (unit5 !== undefined && unit5 !== "") ? unit5 : grade.unit5;
        grade.unit6 = (unit5 !== undefined && unit6 !== "") ? unit6 : grade.unit6;
        grade.unit7 = (unit5 !== undefined && unit7 !== "") ? unit7 : grade.unit7;
        grade.unit8 = (unit5 !== undefined && unit8 !== "") ? unit8 : grade.unit8;
        await grade.save();
        results.push({ userId, status: "تم التحديث", grade });
      } else {
        const newGrade = await Grade.create({
          userId,
          unit1: cleanGrade(unit1),
          unit2: cleanGrade(unit2),
          unit3: cleanGrade(unit3),
          unit4: cleanGrade(unit4),
          unit5: cleanGrade(unit5),
          unit6: cleanGrade(unit6),
          unit7: cleanGrade(unit7), 
          unit8: cleanGrade(unit8)
        });
        results.push({ userId, status: "تمت الإضافة", grade: newGrade });
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
      attributes: ['id', 'name'],
      include: [
        {
          model: Grade,
          as: 'grade',
          attributes: ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6', 'unit7', 'unit8'],
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
      attributes: ['id', 'name'],
      include: [
        {
          model: Grade,
          as: 'grade',
          attributes: ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6', 'unit7', 'unit8'],
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
