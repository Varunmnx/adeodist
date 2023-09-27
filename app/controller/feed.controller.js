const { Feed } = require("../models/Feed.model");
const { RESPONSES, ROLES } = require("../common/enum.js");
const { UserFeedAccess } = require("../models/UserFeedAccess.model");
const { User } = require("../models/user.model");

exports.create = async (req, res, next) => {
  try {
    let { name, url, description } = req.body;
    if (!name) {
      return res.status(RESPONSES.failure).json({ message: "provide a name" });
    }
    if (!url) {
      return res.status(RESPONSES.failure).json({ message: "provide a url" });
    }
    if (!description) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "provide a description" });
    }
    let newFeed = await Feed.create({
      name,
      url,
      description,
    });
    if (!newFeed) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "something went wrong" });
    }
    return res.status(RESPONSES.success).json({ feed: newFeed });
  } catch (err) {
    console.log(err);
    return res.status(RESPONSES.failure).json({ message: err });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, user_id } = req.user;
    if (role === ROLES.SuperAdmin) {
      await UserFeedAccess.destroy({ where: { FeedId: id } });
      let deletedFeed = await Feed.destroy({ where: { id } });

      if (deletedFeed) {
        return res
          .status(RESPONSES.success)
          .json({ message: "successfully deleted Feed" });
      }
    }

    let allowedFeeds = await User.findOne({
      include: [{ model: Feed, through: UserFeedAccess, as: "Feeds" }],
      where: {
        id: user_id,
        "$Feeds.UserFeedAccess.accessLevel$": ["ALL", "READ_WRITE"],
        "$Feeds.id$": id,
      },
    });

    if (!allowedFeeds) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "Feed not found on db" });
    }

    if (!allowedFeeds.hasDeleteAccess) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "Admin donot have delete access" });
    }

    await UserFeedAccess.destroy({ where: { FeedId: id } });
    let deletedFeed = await Feed.destroy({ where: { id } });
    if (deletedFeed) {
      return res
        .status(RESPONSES.success)
        .json({ message: "successfully deleted Feed" });
    }

    return res
      .status(RESPONSES.failure)
      .json({ message: "something went wrong" });
  } catch (err) {
    console.log(err);
    return res.status(RESPONSES.failure).json({ message: err });
  }
};

exports.getOne = async (req, res, next) => {
  try {
    let { id } = req.params;
    let { user_id, role } = req.user;

    if (role === ROLES.SuperAdmin) {
      let allFeeds = await Feed.findOne({ where: { id } });
      return res.status(RESPONSES.success).json(allFeeds);
    }

    let allowedFeeds = await User.findOne({
      include: [{ model: Feed, through: UserFeedAccess, as: "Feeds" }],
      where: {
        id: user_id,
        "$Feeds.UserFeedAccess.accessLevel$": ["ALL", "READ_WRITE"],
        "$Feeds.id$": id,
      },
    });

    if (!allowedFeeds) {
      return res
        .status(RESPONSES.failure)
        .json({ message: "Feed not found on db" });
    }
    return res
      .status(RESPONSES.success)
      .json({ feeds: [...allowedFeeds.Feeds] });
  } catch (err) {
    console.log(err);
    return res.status(RESPONSES.failure).json({ message: err });
  }
};

//create one feed
exports.getAll = async (req, res, next) => {
  try {
    let { role, user_id } = req.user;

    if (role === ROLES.SuperAdmin) {
      let allFeeds = await Feed.findAll();
      return res.status(RESPONSES.success).json({ feed: allFeeds });
    }

    if (role === ROLES.Admin || role === ROLES.Basic) {
      let allowedFeeds = await User.findOne({
        include: [{ model: Feed, through: UserFeedAccess, as: "Feeds" }],
        where: {
          id: user_id,
          "$Feeds.UserFeedAccess.accessLevel$": ["ALL", "READ_WRITE"],
        },
      });

      return res
        .status(RESPONSES.success)
        .json({ feeds: [...allowedFeeds.Feeds] });
    }

    return res
      .status(RESPONSES.failure)
      .json({ message: "Something went wrong" });
  } catch (err) {
    console.log(err);
    return res.status(RESPONSES.failure).json({ message: err });
  }
};

// update one feed
exports.update = async (req, res, next) => {
  try {
    let { id } = req.params;
    const { user_id, role } = req.user;
    if (role === ROLES.SuperAdmin) {
      let updatedFeed = await Feed.update(req.body, {
        where: { id },
        returning: true,
        plain: true,
      });
      return res.status(RESPONSES.success).json(updatedFeed);
    }
    let allowedFeeds = await User.findOne({
      include: [{ model: Feed, through: UserFeedAccess, as: "Feeds" }],
      where: {
        id: user_id,
        "$Feeds.UserFeedAccess.accessLevel$": ["ALL", "READ_WRITE"],
        "$Feeds.id$": id,
      },
    });

    if (!allowedFeeds) {
      return res.status(RESPONSES.failure).json({ message: "not authorized" });
    }

    await Feed.update(req.body, { where: { id } });
    let updatedFeed = await Feed.findByPk(id);

    return res.status(RESPONSES.success).json(updatedFeed);
  } catch (err) {
    console.log(err);
    return res.status(RESPONSES.failure).json({ message: err });
  }
};
