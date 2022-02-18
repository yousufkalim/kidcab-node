/**
 * Notifications CRUD controllers
 * @author Shuja Naqvi
 */
const Notifications = require("../models/Notifications");
const Users = require("../models/Users");
const cron = require("node-cron");
const io = require("../index");
const socket = require("../index");
const Drivers = require("../models/Drivers");
/**
 * Get all Notifications
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notifications.find({
      receiver: userId,
    });
    if (!notifications)
      return res.status(404).json("notifications does not found");
    return res.status(202).json({ success: true, notifications });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * See Notification
 * @param {object} req
 * @param {object} res
 */
exports.seen = async (req, res) => {
  try {
    const userId = req.params.userId;
    await Notifications.updateMany(
      { receiver: userId, seen: false },
      { seen: true }
    );
    return res
      .status(202)
      .json({ success: true, message: "Seen Successfully" });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get notification by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await Notifications.findById(notificationId);
    if (!notification) return res.status(404).send("notification not found");
    else return res.status(202).json({ success: true, notification });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete Notification
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const deletedNotification = await Notifications.findByIdAndDelete(
      notificationId
    );
    if (!deletedNotification)
      return res.status(404).json("Can't delete Notification");
    else return res.status(202).json({ success: true, deletedNotification });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete Notification
 * @param {object} req
 * @param {object} res
 */

exports.deleteAll = async (req, res) => {
  try {
    const userId = req.params.userId;
    const deletedNotification = await Notifications.deleteMany({
      receiver: userId,
    });
    if (deletedNotification.deletedCount == 0) {
      return res
        .status(400)
        .json({ success: false, message: "Can’t delete Notification" });
    } else {
      return res
        .status(202)
        .json({ success: true, message: "All Notifications Deleted" });
    }
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//cron-job that will run after every 10days to delete all expired notifications from DB
cron.schedule("0 5 */10 * *", async () => {
  const timeNow = new Date();
  const delNotifications = await Notifications.deleteMany({
    expiry_date: { $lt: timeNow },
  });
});
//cron-job that will run after every 15days to notify drivers regarding
//"0 7 */15 * *"
cron.schedule("0 7 */15 * *", async () => {
  const timeNow = new Date();
  const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
  const fifteenDays = new Date(daysCount); //Set date after 15days
  const driver = await Drivers.find({
    $or: [
      { criminal_record_date: { $lt: timeNow } },
      { ris_date: { $lt: timeNow } },
      { kbis_date: { $lt: timeNow } },
      { proRc_date: { $lt: timeNow } },
      { criminal_record_date: { $lt: timeNow } },
    ],
  });
  driver.map(async (item) => {
    console.log("item", item._id);
    io.socket.emit(`receive_documentStatus${item.id}`, {
      message: "Vos documents expireront bientôt, veuillez les mettre à jour ",
    });

    const notification = await Notifications.create({
      title: "Vos documents expireront bientôt, veuillez les mettre à jour ",
      expiry_date: fifteenDays,
      receiver: item.id,
    });

    await Drivers.findByIdAndUpdate(item.id, {
      $push: {
        notifications: notification.id,
      },
    });
  });
});
