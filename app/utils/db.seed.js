const { User } = require("../models/user.model");
const { Role } = require("../models/Role.model");
const { defaultRoles, ROLES } = require("../common/enum.js");
const bcrypt = require("bcryptjs");

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
    let password = "Admin@123";
    let encryptedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: encryptedPassword,
      roleId: superAdminRole.id,
    });
  } else {
    console.log("a super admin exists");
  }
};
