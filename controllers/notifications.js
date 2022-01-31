/**
 * Notifications CRUD controllers
 * @author Shuja Naqvi
 */
const Notifications = require("../models/notifications");
const Users = require("../models/Users");
const cron = require("node-cron");
const io = require("../index");
/**
 * Get all Notifications
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const notifications = await Notifications.find({
      user: req.params.userId,
    }).populate("driver");
    if (!notifications)
      return res.status(404).json("notifications does not found");
    return res.json({ success: true, invoices });
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
    const notification = await Notifications.findById(notificationId).populate(
      "driver"
    );
    if (!notification) return res.status(404).send("notification not found");
    else return res.json({ success: true, notification });
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
    res.json({ success: true, deletedNotification });
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
      user: userId,
    });
    if (!deletedNotification)
      return res.status(404).json("Can't delete Notification");
    res.json({ success: true, deletedNotification });
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

//
// io.emit(`feedback${driver.id}`, {
//   message: "Thank You for the ride",
// });
// const notification = await Notifications.create({
//   title: "Thank You for the ride",
//   expiry_date: fifteenDays,
//   driver: driver.id,
// });
// const driverNotification = await Drivers.findByIdAndUpdate(driver.id, {
//   $push: {
//     notifications: notification.id,
//   },
// });
