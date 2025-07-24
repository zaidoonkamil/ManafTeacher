const User = require("./user");
const UserDevice = require("./user_device");
const Course = require("./course");
const UserCourses = require("./UserCourses");
const Question = require("./question");
const Choice = require("./choice");
const ExamAnswer = require('./examAnswer');
const QuestionAnswer = require('./questionAnswer');
const Exam = require('./exam'); 
const TextExamAnswer = require("./TextExamAnswer");

// علاقات الأجهزة مع المستخدم
User.hasMany(UserDevice, { foreignKey: 'user_id', as: 'devices', onDelete: 'CASCADE' });
UserDevice.belongsTo(User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

Question.belongsTo(Exam, { foreignKey: 'examId', as: 'exam', onDelete: 'CASCADE' });
Exam.hasMany(Question, { foreignKey: 'examId', as: 'questions', onDelete: 'CASCADE' });

User.hasMany(ExamAnswer, { foreignKey: 'userId', as: 'examAnswers', onDelete: 'CASCADE' });
ExamAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

TextExamAnswer.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
User.hasMany(TextExamAnswer, { foreignKey: 'userId', as: 'textExamAnswers', onDelete: 'CASCADE' });

User.belongsToMany(Course, {through: UserCourses,foreignKey: 'userId',otherKey: 'courseId',as: 'courses',onDelete: 'CASCADE'});
Course.belongsToMany(User, {through: UserCourses,foreignKey: 'courseId',otherKey: 'userId',as: 'users',onDelete: 'CASCADE'})

// سؤال يحتوي على عدة اختيارات
Question.hasMany(Choice, { foreignKey: 'questionId', as: 'choices', onDelete: 'CASCADE' });
Choice.belongsTo(Question, { foreignKey: 'questionId', as: 'question', onDelete: 'CASCADE' });

// إجابة امتحان تحتوي على إجابات لأسئلة متعددة
ExamAnswer.hasMany(QuestionAnswer, { foreignKey: 'examAnswerId', as: 'questionAnswers', onDelete: 'CASCADE' });
QuestionAnswer.belongsTo(ExamAnswer, { foreignKey: 'examAnswerId', as: 'examAnswer', onDelete: 'CASCADE' });

// العلاقة بين السؤال والإجابات الفردية عليه
Question.hasMany(QuestionAnswer, { foreignKey: 'questionId', as: 'questionAnswers', onDelete: 'CASCADE' });
QuestionAnswer.belongsTo(Question, { foreignKey: 'questionId', as: 'question', onDelete: 'CASCADE' });


module.exports = {
  User,
  UserDevice,
  Course,
 UserCourses,
  Question,
  ExamAnswer,
  QuestionAnswer,
  Choice,
  Exam,
  TextExamAnswer,
};
