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
