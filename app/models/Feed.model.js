const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/connection");

const Feed = sequelize.define(
  "Feed",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Feed.sync({ force: false });
module.exports = { Feed };
