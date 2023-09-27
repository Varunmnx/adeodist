const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/connection");
const { User } = require("./user.model");
const Role = sequelize.define(
  "Role",
  {
    // Model attributes are defined here
    roleType: {
      type: DataTypes.ENUM,
      values: ["Admin", "SuperAdmin", "Basic"],
    },
  },
  {
    // Other model options go here
    timestamps: true,
  }
);

Role.sync({ force: false });
module.exports = { Role };
