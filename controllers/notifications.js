/**
 * Notifications CRUD controllers
 * @author Shuja Naqvi
 */
const Notifications = require('../models/Notifications');
const Users = require('../models/Users');
const cron = require('node-cron');
const io = require('../index');
const socket = require('../index');
const fcmservice = require('../utils/fcmService');
const Trips = require('../models/Trips');
const Drivers = require('../models/Drivers');
const Admin = require('../models/Admins');
const moment = require('moment');

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
    if (!notifications) return res.status(404).json('notifications does not found');
    return res.status(202).json({ success: true, notifications });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
/**
 * See Notification
 * @param {object} req
 * @param {object} res
 */

exports.getAllAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne();

    const notifications = await Notifications.find({
      receiver: admin._id,
      seen: false,
    }).sort({ createdAt: -1 });
    if (!notifications) return res.status(404).json('notifications does not found');
    return res.status(202).json({ success: true, notifications });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.seen = async (req, res) => {
  try {
    const userId = req.params.userId;
    await Notifications.updateMany({ receiver: userId, seen: false }, { seen: true });
    return res.status(202).json({ success: true, message: 'Seen Successfully' });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    if (!notification) return res.status(404).send('notification not found');
    else return res.status(202).json({ success: true, notification });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    const deletedNotification = await Notifications.findByIdAndDelete(notificationId);
    if (!deletedNotification) return res.status(404).json("Can't delete Notification");
    else return res.status(202).json({ success: true, deletedNotification });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      return res.status(400).json({ success: false, message: 'Can’t delete Notification' });
    } else {
      return res.status(202).json({ success: true, message: 'All Notifications Deleted' });
    }
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
//cron-job that will run after every 10days to delete all expired notifications from DB
cron.schedule('0 5 */10 * *', async () => {
  const timeNow = new Date();
  const delNotifications = await Notifications.deleteMany({
    expiry_date: { $lt: timeNow },
  });
});
//cron-job that will run after every 15days to notify drivers regarding
cron.schedule('0 7 */15 * *', async () => {
  const timeNow = new Date();
  const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
  const fifteenDays = new Date(daysCount); //Set date after 15days
  var pubMsg = {
    verb: 'published',
    actions: 'Mise à jour des documents', //Documents Update
  };
  //Please update your documents they will be expired soon!
  var pushMessage = 'Veuillez mettre à jour vos documents, ils seront bientôt expirés !';
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
    fcmservice.sendPushMessage(item.fcmToken, 'Mise à jour des documents', pushMessage, pubMsg);
    io?.socket?.emit(`receive_documentStatus${item.id}`, {
      message: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
    });

    const notification = await Notifications.create({
      title: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
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
cron.schedule('0 11 * * *', async () => {
  try {
    const timeNow = new Date();
    const count = new Date().getTime() + 86400000; //add 24 hours
    const Daycount = new Date(count); //one day count
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    var pubMsg = {
      verb: 'published',
      actions: '24 heures restantes pour rouler', //24 hours left for ride
    };
    //Please update your documents they will be expired soon!
    var pushMessage = '24 heures restantes pour rouler!';
    //find trips of drivers (limit 24 hours)
    const trips = await Trips.find({
      $and: [{ date: { $gt: timeNow } }, { date: { $lt: Daycount } }],
    }).populate({
      path: 'invited_drivers',
      populate: {
        path: 'driver',
      },
    });
    for (let i = 0; i < trips.length; i++) {
      trips[i].invited_drivers.map(async (item) => {
        if (item.driver?.fcmToken) {
          fcmservice.sendPushMessage(item.driver.fcmToken, 'Mise à jour des documents', pushMessage, pubMsg);
          const notification = await Notifications.create({
            title: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
            expiry_date: fifteenDays,
            receiver: item.driver.id,
          });
          await Drivers.findByIdAndUpdate(item.driver.id, {
            $push: {
              notifications: notification.id,
            },
          });
        } else {
          console.log('Not Found');
        }
      });
    }
  } catch (err) {
    console.log(err.message);
  }
});

//expiry date, with admin notification and driver notification 15 days before exp, 1 week before exp, 2 days and day before
cron.schedule('0 0 23 * *', async () => {
  try {
    let timeNow = new Date();
    let daysCount = new Date().getTime() + 1296000000; //Find date of after 15days
    let fifteenDays = new Date(daysCount); //Set date after 15days
    fifteenDays = moment(fifteenDays).format('YYYY-MM-DD');
    fifteenDays = new Date(fifteenDays);

    let sevenDaysCount = new Date().getTime() + 604800000; //Find date of after 7days
    let sevenDays = new Date(sevenDaysCount); //Set date after 7days
    sevenDays = moment(sevenDays).format('YYYY-MM-DD');

    sevenDays = new Date(sevenDays); //Set date after 7days

    let twoDaysCount = new Date().getTime() + 172800000; //Find date of after 2days
    let twoDays = new Date(twoDaysCount); //Set date after 2days
    twoDays = moment(twoDays).format('YYYY-MM-DD');
    twoDays = new Date(twoDays); //Set date after 2days

    let oneDayCount = new Date().getTime() + 86400000; //Find date of after 1day
    let oneDay = new Date(oneDayCount); //Set date after 15days
    oneDay = moment(oneDay).format('YYYY-MM-DD');
    oneDay = new Date(oneDay); //Set date after 15days

    let admin = await Admin.find();
    var pubMsg = {
      verb: 'published',
      actions: 'Mise à jour des documents', //Documents Update
    };
    //Please update your documents they will be expired soon!
    var pushMessage = 'Veuillez mettre à jour vos documents, ils seront bientôt expirés !';
    //driver notification 15 days before
    let drivers15Days = await Drivers.find({
      $or: [
        { criminal_record_date: { $eq: fifteenDays } },
        { ris_date: { $eq: fifteenDays } },
        { kbis_date: { $eq: fifteenDays } },
        { proRc_date: { $eq: fifteenDays } },
        { criminal_record_date: { $eq: fifteenDays } },
      ],
    });
    //driver notification 7 days before
    let drivers7Days = await Drivers.find({
      $or: [
        { criminal_record_date: { $eq: sevenDays } },
        { ris_date: { $eq: sevenDays } },
        { kbis_date: { $eq: sevenDays } },
        { proRc_date: { $eq: sevenDays } },
        { criminal_record_date: { $eq: sevenDays } },
      ],
    });
    //driver notification 2 days before
    let drivers2Days = await Drivers.find({
      $or: [
        { criminal_record_date: { $eq: twoDays } },
        { ris_date: { $eq: twoDays } },
        { kbis_date: { $eq: twoDays } },
        { proRc_date: { $eq: twoDays } },
        { criminal_record_date: { $eq: twoDays } },
      ],
    });

    //driver notification 1 day before
    let drivers1Day = await Drivers.find({
      $or: [
        { criminal_record_date: { $eq: oneDay } },
        { ris_date: { $eq: oneDay } },
        { kbis_date: { $eq: oneDay } },
        { proRc_date: { $eq: oneDay } },
        { criminal_record_date: { $eq: oneDay } },
      ],
    });
    //sending notification before 15 days
    if (drivers15Days.length > 0) {
      drivers15Days.map(async (item) => {
        fcmservice.sendPushMessage(item?.fcmToken, 'Mise à jour des documents', pushMessage, pubMsg);
        io?.socket?.emit(`receive_documentStatus${item.id}`, {
          message: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
        });
        io?.socket?.emit(`admin`, {
          message: `les documents de ${item.first_name} expirent quinze sept jour`,
        });
        await createNotification(item?.id, fifteenDays);
        await createNotificationAdmin(admin[0]?._id, item.first_name, fifteenDays);
      });
    }
    if (drivers7Days.length > 0) {
      //sending notification before 7 days
      drivers7Days.map(async (item) => {
        fcmservice.sendPushMessage(item?.fcmToken, 'Mise à jour des documents', pushMessage, pubMsg);
        io?.socket?.emit(`receive_documentStatus${item.id}`, {
          message: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
        });

        io?.socket?.emit(`admin`, {
          message: `les documents de ${item.first_name} expirent après sept jour`,
        });
        await createNotification(item?.id, fifteenDays);
        await createNotificationAdmin(admin[0]?._id, item.first_name, fifteenDays);
      });
    }
    if (drivers2Days.length > 0) {
      //sending notification before 2 days
      drivers2Days.map(async (item) => {
        fcmservice.sendPushMessage(item?.fcmToken, 'Mise à jour des documents', pushMessage, pubMsg);
        io?.socket?.emit(`receive_documentStatus${item.id}`, {
          message: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
        });
        io?.socket?.emit(`admin`, {
          message: `les documents de ${item.first_name} expirent après deux jour`,
        });
        await createNotification(item?.id, fifteenDays);
        await createNotificationAdmin(admin[0]?._id, item.first_name, fifteenDays);
      });
    }
    if (drivers1Day.length > 0) {
      //sending notification before 1 day
      drivers1Day.map(async (item) => {
        fcmservice.sendPushMessage(item?.fcmToken, 'Mise à jour des documents', pushMessage, pubMsg);
        io?.socket?.emit(`receive_documentStatus${item.id}`, {
          message: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
        });
        io?.socket?.emit(`admin`, {
          message: `les documents de ${item.first_name} expirent après un jour`,
        });
        await createNotification(item?.id, fifteenDays);
        await createNotificationAdmin(admin[0]?._id, item.first_name, fifteenDays);
      });
    }
  } catch (error) {
    console.log('err', error.message);
  }
});

//function that will create notification in Db  for drivers
const createNotification = async (driverId, fifteenDays) => {
  const notification = await Notifications.create({
    title: 'Vos documents expireront bientôt, veuillez les mettre à jour ',
    expiry_date: fifteenDays,
    receiver: driverId,
  });

  await Drivers.findByIdAndUpdate(driverId, {
    $push: {
      notifications: notification.id,
    },
  });
};

//function that will create notification in Db  for admins
const createNotificationAdmin = async (adminId, first_name, fifteenDays) => {
  await Notifications.create({
    title: `Le document de ${first_name} expirera bientôt `,
    expiry_date: fifteenDays,
    receiver: adminId,
  });
};
