const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/connection");
const { Role } = require("./Role.model");
const { Feed } = require("./Feed.model");
const User = sequelize.define(
  "User",
  {
    // Model attributes are defined here

    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hasDeleteAccess: { type: DataTypes.BOOLEAN, defaultValue: false },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        Key: "id",
      },
    },
  },
  {
    // Other model options go here
    timestamps: true,
  }
);
// Define associations after defining all models

User.sync({ force: false });
module.exports = { User };
