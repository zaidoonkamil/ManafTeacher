const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Grade = sequelize.define('Grade', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unit1: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit2: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit3: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit4: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit5: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit6: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit7: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  unit8: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
}, {
  timestamps: true,
});

module.exports = Grade;
