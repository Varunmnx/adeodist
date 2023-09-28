const { RESPONSES } = require("../common/enum");
const { User } = require("../models/user.model");
const { UserFeedAccess } = require("../models/UserFeedAccess.model");
const jwt = require("jsonwebtoken");
const { ROLES } = require("../common/enum");
const { Role } = require("../models/Role.model");
const { Feed } = require("../models/Feed.model");

exports.findOne = async (req, res, next) => {
  try {
    const { id, role } = req.params;
    let user = await User.findByPk(id, {
      include: [
        { model: Role },
        { model: Feed, through: UserFeedAccess, as: "Feeds" },
      ],
    });
    console.log(user);
    if (!user) {
      return res
        .status(RESPONSES.notFound)
        .json({ messge: "user not found on db" });
    }
    console.log(user);
    // prevent super admin get
    if (user.dataValues.Role.roleType === ROLES.SuperAdmin) {
      return res
        .status(RESPONSES.notFound)
        .json({ messge: "You cant view super admin" });
    }
    // prevent admins from viewing admins
    if (user.dataValues.Role.roleType === ROLES.Admin && role === ROLES.Admin) {
      return res
        .status(RESPONSES.notFound)
        .json({ messge: "You cant view other admins" });
    }

    return res.status(RESPONSES.success).json({ ...user.dataValues });
  } catch (error) {
    console.log(error);
    return res.status(RESPONSES.failure).json({ message: error.message });
  }
};

exports.create = async (req, res, next) => {
  try {
    const { user_id, role: currentUserRole } = req.user;
    let { name, role, email, password } = req.body;
    if (!name || !role || !email || !password) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "kindly provide a name, role , email , password" });
    }

    // check if role is valid
    if (role && !Object.values(ROLES).includes(role)) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "kindly provide a Valid User Role" });
    }

    // check if user is triying to create a super user
    if (role === ROLES.SuperAdmin) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "only one super admin is allowed" });
    }

    let userRole = await Role.findOne({ where: { roleType: role } });
    let existingUser = await User.findOne({ where: { email, password } });

    // check if user is existing
    if (existingUser) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "A user already exist" });
    }
    // check if user is super user
    if (currentUserRole === ROLES.SuperAdmin) {
      let newUser = await User.create(
        { ...req.body, roleId: userRole.id },
        { include: "Role" }
      );
      return res.status(RESPONSES.success).json({ ...newUser.dataValues });
    }
    // prevent Admin from creating another admin and anoter super admin
    else if (
      currentUserRole === ROLES.Admin &&
      role !== ROLES.SuperAdmin &&
      role !== ROLES.Admin
    ) {
      let newUser = await User.create(
        { ...req.body, roleId: userRole.id },
        { include: "Role" }
      );
      return res.status(RESPONSES.success).json({ ...newUser.dataValues });
    }

    return res
      .status(RESPONSES.failure)
      .json({ message: "you are not allowed to perform this operation" });
  } catch (error) {
    console.error(error.message);
    return res.status(RESPONSES.failure).json({ message: error.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(RE);
    }
    let existingUser = await User.findOne({
      where: { email, password },
      include: "Role",
    });

    let userRole = await Role.findByPk(existingUser.roleId);
    console.log(userRole);
    if (!existingUser) {
      return res
        .status(RESPONSES.notFound)
        .json({ message: "user does not exist" });
    }

    const token = jwt.sign(
      {
        user_id: existingUser.id,
        email: existingUser.email,
        role: userRole.roleType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res
      .status(RESPONSES.success)
      .json({ token, ...existingUser.dataValues });
  } catch (error) {
    console.error(error);
    return res.status(RESPONSES.failure).json({ message: error.message });
  }
};

exports.update = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user_id, role } = req.user;

    let existingUser = await User.findByPk(id, { include: "Role" });

    if (!existingUser) {
      return res.status(RESPONSES.failure).json({
        message: `User is not in db`,
      });
    }

    //check if the roles are valid
    if (!Object.values(ROLES).includes(req.body.role)) {
      return res.status(RESPONSES.failure).json({
        message: `please provide any of these roles ${Object.values(ROLES)}`,
      });
    }

    // admin not allowed to edit admin or superadmin
    if (
      role === ROLES.Admin &&
      (existingUser.Role.roleType === ROLES.Admin ||
        existingUser.Role.roleType === ROLES.SuperAdmin)
    ) {
      return res.status(RESPONSES.failure).json({
        message: `Admin cannot CRUD another Admin or super user`,
      });
    }

    // admin cannot edit user roles
    if (role === ROLES.Admin && req.body.role) {
      return res.status(RESPONSES.failure).json({
        message: `Admin cannot edit user roles`,
      });
    }
    // only super admin can edit user roles
    if (role === ROLES.SuperAdmin && req.body.role) {
      let newRole = await Role.findOne({
        where: { roleType: req.body.role },
      });

      await User.update(
        { ...req.body, roleId: newRole.dataValues.id },
        { where: { id } }
      );
      let updatedUser = await User.findByPk(id);
      return res.status(RESPONSES.success).json({ ...updatedUser.dataValues });
    }

    await User.update({ ...req.body }, { where: { id } });

    let updatedUser = await User.findByPk(id);

    if (updatedUser) {
      return res.status(RESPONSES.success).json({ ...updatedUser.dataValues });
    }
    return res
      .status(RESPONSES.failure)
      .json({ message: "user was not updated" });
  } catch (error) {
    console.error(error);
    return res.status(RESPONSES.failure).json({ message: error.message });
  }
};

exports.delete = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user_id, role } = req.user;

    let existingUser = await User.findByPk(id, { include: "Role" });

    if (!existingUser) {
      return res.status(RESPONSES.failure).json({
        message: `User is not in db`,
      });
    }

    // admin cannot delete another admin or another super user
    if (
      role === ROLES.Admin &&
      (existingUser.Role.roleType === ROLES.Admin ||
        existingUser.Role.roleType === ROLES.SuperAdmin)
    ) {
      return res.status(RESPONSES.failure).json({
        message: `Admin cannot CRUD another Admin or super admin`,
      });
    }

    // only super admin can delete users
    else if (role === ROLES.SuperAdmin) {
      await UserFeedAccess.destroy({ where: { UserId: id } });
      await User.destroy({ where: { id } });
      return res
        .status(RESPONSES.success)
        .json({ message: "user successfully deleted" });
    } else if (
      role === ROLES.Admin &&
      existingUser.Role.roleType === ROLES.Basic
    ) {
      await UserFeedAccess.destroy({ where: { UserId: id } });
      await User.destroy({ where: { id } });
      return res
        .status(RESPONSES.success)
        .json({ message: "user successfully deleted" });
    }
    return res
      .status(RESPONSES.failure)
      .json({ message: "deleting user failed" });
  } catch (error) {
    console.error(error);
    res.status(RESPONSES.failure).json({ message: error.message });
  }
};

exports.allowToDeleteFeed = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { hasDeleteAccess } = req.body;

    const existingUser = await User.findByPk(id, { include: "Role" });
    if (!existingUser) {
      return res
        .status(RESPONSES.notFound)
        .json({ message: "user do not exist on db" });
    }
    console.log("existingUser", existingUser.dataValues.Role.roleType);

    if (!existingUser) {
      return res.status(RESPONSES.notFound).json({ message: "user not in db" });
    }
    if (existingUser.dataValues.Role.roleType !== ROLES.Admin) {
      return res
        .status(RESPONSES.notFound)
        .json({ message: "cannot permit Basic user to delete a feed" });
    }

    if (typeof hasDeleteAccess !== "boolean") {
      return res
        .status(RESPONSES.failure)
        .json({ message: "provide a boolean value" });
    }

    await User.update({ hasDeleteAccess }, { where: { id } });

    let userWithPermission = await User.findByPk(id);

    return res
      .status(RESPONSES.success)
      .json({ ...userWithPermission.dataValues });
  } catch (error) {
    console.error(error);
    return res.status(RESPONSES.failure).json({ message: error.message });
  }
};
