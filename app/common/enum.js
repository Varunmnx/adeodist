const roles = {
  Admin: "Admin",
  SuperAdmin: "SuperAdmin",
  Basic: "Basic",
};

exports.ROLES = {
  Admin: "Admin",
  SuperAdmin: "SuperAdmin",
  Basic: "Basic",
};

exports.RESPONSES = {
  success: 201,
  failure: 501,
  notFound: 404,
};

exports.defaultRoles = [
  { roleType: roles.Admin },
  { roleType: roles.SuperAdmin },
  { roleType: roles.Basic },
];

exports.ACCESS_LEVELS = {
  READ_WRITE: "READ_WRITE",
  ALL: "ALL",
  RESTRICT: "RESTRICT",
};
