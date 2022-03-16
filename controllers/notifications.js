/**
 * Notifications CRUD controllers
 * @author Shuja Naqvi
 */
const Notifications = require("../models/Notifications");
const Users = require("../models/Users");
const cron = require("node-cron");
const io = require("../index");
const socket = require("../index");
const fcmservice = require("../utils/fcmService");
const Trips = require("../models/Trips");
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
cron.schedule("0 7 */15 * *", async () => {
  const timeNow = new Date();
  const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
  const fifteenDays = new Date(daysCount); //Set date after 15days
  var pubMsg = {
    verb: "published",
    actions: "Mise à jour des documents", //Documents Update
  };
  //Please update your documents they will be expired soon!
  var pushMessage =
    "Veuillez mettre à jour vos documents, ils seront bientôt expirés !";
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
    fcmservice.sendPushMessage(
      item.fcmToken,
      "Mise à jour des documents",
      pushMessage,
      pubMsg
    );
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
//cron-job that will run after every  hours  to notify drivers regarding upcomming rides(24 hours)
cron.schedule("* * * * *", async () => {
  try {
    const timeNow = new Date();
    const count = new Date().getTime() + 86400000; //add 24 hours
    const Daycount = new Date(count); //one day count
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    var pubMsg = {
      verb: "published",
      actions: "24 heures restantes pour rouler", //24 hours left for ride
    };
    //Please update your documents they will be expired soon!
    var pushMessage = "24 heures restantes pour rouler!";
    //find trips of drivers (limit 24 hours)
    const trips = await Trips.find({
      $and: [{ date: { $gt: timeNow } }, { date: { $lt: Daycount } }],
    }).populate({
      path: "invited_drivers",
      populate: {
        path: "driver",
      },
    });
    for (let i = 0; i < trips.length; i++) {
      trips[i].invited_drivers.map(async (item) => {
        if (item.driver?.fcmToken) {
          fcmservice.sendPushMessage(
            item.driver.fcmToken,
            "Mise à jour des documents",
            pushMessage,
            pubMsg
          );
          const notification = await Notifications.create({
            title:
              "Vos documents expireront bientôt, veuillez les mettre à jour ",
            expiry_date: fifteenDays,
            receiver: item.driver.id,
          });
          await Drivers.findByIdAndUpdate(item.driver.id, {
            $push: {
              notifications: notification.id,
            },
          });
        } else {
          console.log("Not Found");
        }
      });
    }
  } catch (err) {
    console.log(err.message);
  }
});

//expiry date, with admin notification and driver notification 15 days before exp, 1 week before exp, 2 days and day before
cron.schedule("0 0 23 * *", async () => {
  const timeNow = new Date();
  const daysCount = new Date().getTime() + 1296000000; //Find date of after 15days
  const fifteenDays = new Date(daysCount); //Set date after 15days
  const sevenDaysCount = new Date().getTime() + 604800000; //Find date of after 7days
  const sevenDays = new Date(sevenDaysCount); //Set date after 7days
  const twoDaysCount = new Date().getTime() + 172800000; //Find date of after 2days
  const twoDays = new Date(twoDaysCount); //Set date after 2days
  const oneDayCount = new Date().getTime() + 86400000; //Find date of after 1day
  const oneDay = new Date(oneDayCount); //Set date after 15days

  var pubMsg = {
    verb: "published",
    actions: "Mise à jour des documents", //Documents Update
  };
  //Please update your documents they will be expired soon!
  var pushMessage =
    "Veuillez mettre à jour vos documents, ils seront bientôt expirés !";
  //driver notification 15 days before
  const drivers15Days = await Drivers.find({
    $or: [
      { criminal_record_date: { $lte: fifteenDays } },
      { ris_date: { $lte: fifteenDays } },
      { kbis_date: { $lte: fifteenDays } },
      { proRc_date: { $lte: fifteenDays } },
      { criminal_record_date: { $lte: fifteenDays } },
    ],
  });
  //driver notification 7 days before
  const drivers7Days = await Drivers.find({
    $or: [
      { criminal_record_date: { $lte: sevenDays } },
      { ris_date: { $lte: sevenDays } },
      { kbis_date: { $lte: sevenDays } },
      { proRc_date: { $lte: sevenDays } },
      { criminal_record_date: { $lte: sevenDays } },
    ],
  });
  //driver notification 2 days before
  const drivers2Days = await Drivers.find({
    $or: [
      { criminal_record_date: { $lte: twoDays } },
      { ris_date: { $lte: twoDays } },
      { kbis_date: { $lte: twoDays } },
      { proRc_date: { $lte: twoDays } },
      { criminal_record_date: { $lte: twoDays } },
    ],
  });

  //driver notification 1 day before
  const drivers1Day = await Drivers.find({
    $or: [
      { criminal_record_date: { $lte: oneDay } },
      { ris_date: { $lte: oneDay } },
      { kbis_date: { $lte: oneDay } },
      { proRc_date: { $lte: oneDay } },
      { criminal_record_date: { $lte: oneDay } },
    ],
  });
  //sending notification before 15 days
  drivers15Days.map(async (item) => {
    fcmservice.sendPushMessage(
      item?.fcmToken,
      "Mise à jour des documents",
      pushMessage,
      pubMsg
    );
    io.socket.emit(`receive_documentStatus${item.id}`, {
      message: "Vos documents expireront bientôt, veuillez les mettre à jour ",
    });
    io.socket.emit(`admin`, {
      message: `les documents de ${item.first_name} expirent quinze sept jour`,
    });
    await createNotification(item?.id, fifteenDays);
  });
  //sending notification before 7 days
  drivers7Days.map(async (item) => {
    fcmservice.sendPushMessage(
      item?.fcmToken,
      "Mise à jour des documents",
      pushMessage,
      pubMsg
    );
    io.socket.emit(`receive_documentStatus${item.id}`, {
      message: "Vos documents expireront bientôt, veuillez les mettre à jour ",
    });

    io.socket.emit(`admin`, {
      message: `les documents de ${item.first_name} expirent après sept jour`,
    });
    await createNotification(item?.id, fifteenDays);
  });
  //sending notification before 2 days
  drivers2Days.map(async (item) => {
    fcmservice.sendPushMessage(
      item?.fcmToken,
      "Mise à jour des documents",
      pushMessage,
      pubMsg
    );
    io.socket.emit(`receive_documentStatus${item.id}`, {
      message: "Vos documents expireront bientôt, veuillez les mettre à jour ",
    });
    io.socket.emit(`admin`, {
      message: `les documents de ${item.first_name} expirent après deux jour`,
    });
    await createNotification(item?.id, fifteenDays);
  });
  //sending notification before 1 day
  drivers1Day.map(async (item) => {
    fcmservice.sendPushMessage(
      item?.fcmToken,
      "Mise à jour des documents",
      pushMessage,
      pubMsg
    );
    io.socket.emit(`receive_documentStatus${item.id}`, {
      message: "Vos documents expireront bientôt, veuillez les mettre à jour ",
    });
    io.socket.emit(`admin`, {
      message: `les documents de ${item.first_name} expirent après un jour`,
    });
    await createNotification(item?.id, fifteenDays);
  });
});
//function that will create notification in Db  for drivers
const createNotification = async (driverId, fifteenDays) => {
  const notification = await Notifications.create({
    title: "Vos documents expireront bientôt, veuillez les mettre à jour ",
    expiry_date: fifteenDays,
    receiver: driverId,
  });

  await Drivers.findByIdAndUpdate(driverId, {
    $push: {
      notifications: notification.id,
    },
  });
};
