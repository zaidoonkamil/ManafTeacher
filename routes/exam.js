const express = require('express');
const router = express.Router();
const Exam = require('../models/exam');
const { Question, Choice, ExamAnswer, QuestionAnswer, TextExamAnswer} = require('../models');
const multer = require("multer");
const upload = multer();

router.post("/exams", upload.none(), async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "العنوان مطلوب" });
    }

    const exam = await Exam.create({ title });

    res.status(201).json({
      message: "تم إنشاء الامتحان بنجاح",
      exam
    });

  } catch (err) {
    console.error("❌ Error creating exam:", err);
    res.status(500).json({ error: "حدث خطأ أثناء إنشاء الامتحان" });
  }
});

router.get("/exams", async (req, res) => {
  try {
    const exams = await Exam.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(exams);
  } catch (err) {
    console.error("❌ Error fetching exams:", err);
    res.status(500).json({ error: "حدث خطأ أثناء جلب الامتحانات" });
  }
}
);

router.post("/questions",async (req, res) => {
  try {
    const { text, examId, choices } = req.body;

    const question = await Question.create({ text, examId });

    for (let choice of choices) {
      await Choice.create({
        text: choice.text,
        isCorrect: choice.isCorrect,
        questionId: question.id
      });
    }

    res.status(201).json({ message: "Question created", question });

  } catch (err) {
    console.error("❌ Error creating question:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/questions/:examId", async (req, res) => {
  try {
    const { examId } = req.params;

    const questions = await Question.findAll({
      where: { examId },
      include: [{
        model: Choice,
        as: 'choices'
      }],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json(questions);
  }
  catch (err) {
    console.error("❌ Error fetching questions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/submit-exam", async (req, res) => {
  try {
    const { userId, examId, answers } = req.body;
    let score = 0;

    const examAnswer = await ExamAnswer.create({ userId, examId, score: 0 });

    for (let ans of answers) {
      const question = await Question.findByPk(ans.questionId, {
        include: [{ model: Choice, as: 'choices' }]
      });

      const correctChoice = question.choices.find(c => c.isCorrect);
      const isCorrect = ans.selectedChoiceId === correctChoice.id;

      if (isCorrect) score++;

      await QuestionAnswer.create({
        examAnswerId: examAnswer.id,
        questionId: ans.questionId,
        selectedChoiceId: ans.selectedChoiceId,
        isCorrect
      });
    }

    examAnswer.score = score;
    await examAnswer.save();

    res.status(200).json({
      message: "تم تسليم الامتحان",
      score,
      total: answers.length
    });

  } catch (err) {
    console.error("❌ Error submitting exam:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/questions/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1. حذف إجابات الطلاب لهذا السؤال
    await QuestionAnswer.destroy({
      where: { questionId: id }
    });

    // 2. حذف الخيارات لهذا السؤال
    await Choice.destroy({
      where: { questionId: id }
    });

    // 3. حذف السؤال نفسه
    const deletedCount = await Question.destroy({
      where: { id }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "السؤال غير موجود" });
    }

    res.status(200).json({ message: "تم حذف السؤال وكل المتعلقات بنجاح" });

  } catch (err) {
    console.error("❌ Error deleting question:", err);
    res.status(500).json({ error: "حدث خطأ أثناء حذف السؤال" });
  }
});

router.post("/questions/bulk", async (req, res) => {
  try {
    const { examId, questions } = req.body;

    if (!examId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "examId و questions مطلوبان" });
    }

    const createdQuestions = [];

    for (let text of questions) {
      if (typeof text === 'string' && text.trim() !== '') {
        const question = await Question.create({
          text: text.trim(),
          examId
        });
        createdQuestions.push(question);
      }
    }

    res.status(201).json({
      message: "تمت إضافة الأسئلة بنجاح",
      count: createdQuestions.length,
      questions: createdQuestions
    });

  } catch (err) {
    console.error("❌ Error creating bulk questions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/submit-text-answer", upload.array("images",5), async (req, res) => {
  try {
    const { userId, examId } = req.body;

    if (!userId || !examId || !req.files || req.files.length === 0) {
      return res.status(400).json({ error: "userId و examId والملف مطلوبة" });
    }

    const images = req.files.map(file => file.filename);
        
    const existing = await TextExamAnswer.findOne({ where: { userId, examId } });
    if (existing) {
      return res.status(400).json({ error: "لقد قمت برفع الإجابة مسبقًا لهذا الامتحان" });
    }

    const answer = await TextExamAnswer.create({
      userId,
      examId,
      fileUrl: images
    });

    res.status(201).json({
      message: "تم رفع الإجابة بنجاح",
      answer
    });

  } catch (err) {
    console.error("❌ Error uploading text answer:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;