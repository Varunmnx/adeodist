const { verifyToken, verifyRole } = require("../middleware/auth.middleware");
const { ROLES } = require("../common/enum");
module.exports = (app) => {
  const user = require("../controller/user.controller");
  app.post("/user/login", user.login);
  app.get(
    "/user/:id",
    verifyToken,
    verifyRole([ROLES.SuperAdmin, ROLES.Admin]),
    user.findOne
  );
  app.post(
    "/user/register",
    verifyToken,
    verifyRole([ROLES.SuperAdmin, ROLES.Admin]),
    user.create
  );
  app.put(
    "/user/update/:id",
    verifyToken,
    verifyRole([ROLES.SuperAdmin, ROLES.Admin]),
    user.update
  );
  app.delete(
    "/user/:id",
    verifyToken,
    verifyRole([ROLES.SuperAdmin, ROLES.Admin]),
    user.delete
  );
  // super admin can allow users to delete a feed
  app.put(
    "/user/allow/:id",
    verifyToken,
    verifyRole([ROLES.SuperAdmin]),
    user.allowToDeleteFeed
  );
};
