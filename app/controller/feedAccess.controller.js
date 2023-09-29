const { UserFeedAccess } = require("../models/UserFeedAccess.model");
const { RESPONSES, ACCESS_LEVELS, ROLES } = require("../common/enum.js");
const { Feed } = require("../models/Feed.model");
const { Op } = require("sequelize");
const { User } = require("../models/user.model");

exports.permit = async (req, res, next) => {
  try {
    let { feeds, permission } = req.body;
    let { user_id: id } = req.params;
    let { user_id, role } = req.user;

    if (!Object.keys(ACCESS_LEVELS).includes(permission)) {
      return res
        .status(RESPONSES.failure)
        .json({ messge: "Please provide a valid permission" });
    }
    if (!Array.isArray(feeds) || feeds.length === 0) {
      return res
        .status(RESPONSES.failure)
        .json({ messge: "Please provide feed to perfom operation " });
    }

    let existingUser = await User.findByPk(id, { include: "Role" });

    if (!existingUser) {
      return res
        .status(RESPONSES.notFound)
        .json({ messge: "User not found on DB" });
    }

    if (
      role === ROLES.Admin &&
      (existingUser.dataValues.Role.roleType === ROLES.Admin ||
        existingUser.dataValues.Role.roleType === ROLES.SuperAdmin)
    ) {
      return res
        .status(RESPONSES.failure)
        .json({ messge: "Admin can only allow basic users to access feeds" });
    }

    if (role === ROLES.SuperAdmin) {
      // update existing userfeedaccess or create new one if it is absent

      for (let i = 0; i < feeds.length; i++) {
        let currentFeed = await Feed.findByPk(feeds[i]);
        if (!currentFeed) {
          return res
            .status(RESPONSES.notFound)
            .json({ message: `feed with id ${feeds[i]} doesnot exits` });
        }
      }

      let userFeeds = await Promise.all(
        feeds.map(async (feed) => {
          // Find duplicate entries

          let duplicateFeedAccess = await UserFeedAccess.findAll({
            where: { UserId: id, FeedId: feed },
          });

          if (duplicateFeedAccess.length === 0) {
            console.log({
              UserId: id,
              FeedId: feed,
              accessLevel: permission,
            });

            return {
              UserId: id,
              FeedId: feed,
              accessLevel: permission,
            };
          } else {
            // Handle duplicates if needed
            await UserFeedAccess.update(
              { accessLevel: permission },
              { where: { UserId: id, FeedId: feed } }
            );
            console.log(`Feed ${feed} already exists for user ${id}`);
            return null; // Returning null for duplicates, modify as needed
          }
        })
      );
      await UserFeedAccess.bulkCreate(userFeeds, { ignoreDuplicates: true });
      let allFeeds = await UserFeedAccess.findAll({
        where: {
          UserId: id,
        },
      });

      return res.status(RESPONSES.success).json(allFeeds);
    } else if (
      role === ROLES.Admin &&
      existingUser.dataValues.Role.roleType === ROLES.Basic
    ) {
      let count = 0;
      for (let i = 0; i < feeds.length; i++) {
        let currentFeed = await Feed.findByPk(feeds[i]);
        if (!currentFeed) {
          return res.status(RESPONSES.notFound).json({
            message: `feed with id ${feeds[i]} doesnot exits or you dont have access`,
          });
        }

        // all feeds associated with a particular user
        let feedsAllowedToUser = await UserFeedAccess.findOne({
          where: { feedId: feeds[i], UserId: user_id },
        });

        if (!feedsAllowedToUser) {
          return res.status(RESPONSES.notFound).json({
            message:
              "no such feed exist kindly check the feeds that u provided",
          });
        }

        //  check if user have permission to update permission
        if (
          feedsAllowedToUser.accessLevel === ACCESS_LEVELS.ALL ||
          (ACCESS_LEVELS.READ_WRITE && permission)
        ) {
          // check if user already have a permission created
          let basicUserAccess = await UserFeedAccess.findOne({
            where: { feedId: feeds[i], UserId: id },
          });
          // if permission is not created create one
          if (!basicUserAccess || basicUserAccess.length === 0) {
            console.log("permission does not exist");
            count++;
            await UserFeedAccess.create({
              UserId: id,
              FeedId: feeds[i],
              accessLevel: permission,
            });
          } else {
            await UserFeedAccess.update(
              { accessLevel: permission },
              {
                where: {
                  UserId: id,
                  FeedId: feeds[i],
                },
              }
            );
          }
        }
      }
      let allFeedsWithAccessesForTheUser = await UserFeedAccess.findAll({
        where: { UserId: id },
      });

      return res.json(allFeedsWithAccessesForTheUser);

      // check if current user has right permission
    }

    return res
      .status(RESPONSES.failure)
      .json({ message: "user was not able to be updated" });
  } catch (error) {
    console.log(error);
    return res.status(RESPONSES.failure).json({ message: error.message });
  }
};
