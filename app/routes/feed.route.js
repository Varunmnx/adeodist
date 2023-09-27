const { verifyToken, verifyRole } = require("../middleware/auth.middleware");
const FeedAccess = require("../controller/feedAccess.controller");
const { ROLES } = require("../common/enum");

module.exports = (app) => {
  const feed = require("../controller/feed.controller");
  app.get("/feed", verifyToken, feed.getAll);
  app.get("/feed/:id", verifyToken, feed.getOne);
  app.post(
    "/feed",
    verifyToken,
    verifyRole([ROLES.SuperAdmin, ROLES.Admin]),
    feed.create
  );
  app.put("/feed/:id", verifyToken, feed.update);
  app.delete(
    "/feed/:id",
    verifyToken,
    verifyRole([ROLES.SuperAdmin, ROLES.Admin]),
    feed.delete
  );
  app.post(
    "/feed/permit/:user_id",
    verifyToken,
    verifyRole([ROLES.SuperAdmin, ROLES.Admin]),
    FeedAccess.permit
  );
};
