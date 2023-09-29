const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");

exports.verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
      console.log("%cauth.js line:13 decoded", "color: #007acc;", decoded);

      req.user = decoded;
      return next();
    } catch (error) {
      if (error.name.includes("TokenExpiredError")) {
        return res.status(401).send("Token expired");
      } else {
        return res.status(401).send("Invalid token");
      }
    }
  } else {
    // Forbidden
    return res.status(403).send("A token is required for authentication");
  }
};

exports.verifyRole = (roles) => {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(403).send("A token is required for authentication");
    }
    const hasRole = roles.includes(req.user.role);
    if (!hasRole) {
      return res.status(401).send("Unauthorized!");
    }
    next();
  };
};
