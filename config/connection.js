const Sequelize = require("sequelize");
const dbConfig = require("./db.config.js");

console.log(dbConfig);
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  port: dbConfig.port,
  operatorsAliases: false,
});

module.exports = sequelize;
