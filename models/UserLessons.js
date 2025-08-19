const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const UserLessons = sequelize.define("UserLessons", {
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = UserLessons;
