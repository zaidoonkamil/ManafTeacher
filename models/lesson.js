const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Course = require('./course');

const Lesson = sequelize.define('Lesson', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  videoUrl: {
    type: DataTypes.STRING
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  description: {
    type: DataTypes.TEXT
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
      key: 'id'
    }
  }
}, {
  timestamps: true
});


module.exports = Lesson;
