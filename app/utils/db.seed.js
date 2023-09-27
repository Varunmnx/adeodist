const { User } = require("../models/user.model");
const { Role } = require("../models/Role.model");
const { defaultRoles, ROLES } = require("../common/enum.js");
exports.seedRoles = async () => {
  let RolesInDB = await Role.findAll();
  if (RolesInDB.length === 0) {
    await Role.bulkCreate(defaultRoles).then((data) => data);

    console.log("seeding roles");
  } else {
    console.log("roles exist");
  }
};

exports.createSuperUser = async () => {
  let superAdminRole = await Role.findOne({
    where: { roleType: ROLES.SuperAdmin },
  });
  let superAdmin = await User.findOne({
    where: { roleId: superAdminRole.id },
  });
  if (!superAdmin) {
    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: "Admin@123",
      roleId: superAdminRole.id,
    });
  } else {
    console.log("a super admin exists");
  }
};
