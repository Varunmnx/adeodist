const fs = require("fs");
const path = require("path");

const logsDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory);
}
const createNewLogFile = (app, morgan) => {
  const timestamp = new Date().toISOString().replace(/:/g, "-");
  const logFileName = `access-${timestamp}.log`;

  const accessLogStream = fs.createWriteStream(
    path.join(logsDirectory, logFileName),
    { flags: "a" }
  );
  app.use(morgan("combined", { stream: accessLogStream }));
};
const getLatestLogFile = () => {
  const logFiles = fs
    .readdirSync(logsDirectory)
    .filter((file) => file.startsWith("access-") && file.endsWith(".log"));
  console.log(logFiles);
  if (logFiles.length === 0) {
    return null;
  }
  const latestLogFile = path.join(logsDirectory, logFiles.sort().pop());
  return latestLogFile;
};
// Function to delete log files older than 30 minutes
const cleanupOldLogFiles = () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const logFiles = fs
    .readdirSync(logsDirectory)
    .filter((file) => file.startsWith("access-") && file.endsWith(".log"));

  logFiles.forEach((file) => {
    const filePath = path.join(logsDirectory, file);
    const fileStat = fs.statSync(filePath);

    if (fileStat.isFile() && fileStat.ctime < thirtyMinutesAgo) {
      fs.unlinkSync(filePath);
    }
  });
};
module.exports = { getLatestLogFile, createNewLogFile, cleanupOldLogFiles };
