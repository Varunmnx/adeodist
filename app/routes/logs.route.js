const { verifyToken, verifyRole } = require("../middleware/auth.middleware");
const { ROLES } = require("../common/enum");
const { getLatestLogFile } = require("../../logging");
const fs = require("fs");
const path = require("path");

module.exports = (app) => {
  app.get(
    "/logs",
    verifyToken,
    verifyRole([ROLES.SuperAdmin]),
    async (req, res, next) => {
      const latestLogFile = getLatestLogFile();
      console.log(latestLogFile);
      if (latestLogFile && fs.existsSync(latestLogFile)) {
        const logContent = fs.readFileSync(latestLogFile, "utf8");
        console.log(logContent);
        res.send(logContent);
      } else {
        res.status(404).send("No log files found.");
      }
    }
  );
};
