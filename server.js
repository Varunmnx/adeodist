const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const sequelize = require("./config/connection.js");

const { seedRoles, createSuperUser } = require("./app/utils/db.seed.js");
const { User } = require("./app/models/user.model.js");
const { Role } = require("./app/models/Role.model.js");
const { Feed } = require("./app/models/Feed.model.js");
const { UserFeedAccess } = require("./app/models/UserFeedAccess.model.js");

// db initialization
sequelize
  .sync()
  .then(() => {
    console.log("Connection has been established successfully.");
    seedRoles().then(() => {
      console.log("creating super users");
      createSuperUser();
      User.belongsTo(Role, { foreignKey: "roleId" });
      Role.hasOne(User);
      User.belongsToMany(Feed, {
        through: "UserFeedAccess",
        as: "Feeds",
      });
      Feed.belongsToMany(User, {
        through: "UserFeedAccess",
        as: "Users",
      });
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

app.use(cors());

app.use(express.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(express.json());

// define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome" });
});

app.delete("/delete/db", async (req, res) => {
  try {
    await sequelize.drop();
    return res.status(201).json({ message: "deleted database" });
  } catch (err) {
    console.log(err);
    return res.status(501).json({ message: err.message });
  }
});

require("./app/routes/feed.route.js")(app);
require("./app/routes/user.route.js")(app);

// eslint-disable-next-line no-undef
app.listen(process.env.SERVER_PORT, () => {
  // eslint-disable-next-line no-undef
  console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});
