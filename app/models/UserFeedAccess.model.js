const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../../config/connection");
const { Feed } = require("./Feed.model");
const { User } = require("./user.model");
const { ACCESS_LEVELS } = require("../common/enum");
const UserFeedAccess = sequelize.define("UserFeedAccess", {
  accessLevel: {
    type: DataTypes.ENUM,
    allowNull: false,
    values: Object.values(ACCESS_LEVELS),
    defaultValue: ACCESS_LEVELS.RESTRICT,
  },
  UserId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  FeedId: {
    type: DataTypes.INTEGER,
    references: {
      model: Feed,
      key: "id",
    },
  },
});
UserFeedAccess.sync({ force: false });
module.exports = { UserFeedAccess };
