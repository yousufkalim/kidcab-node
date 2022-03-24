/**
 * Rides CRUD controllers
 * @author Arooj Ishfaq
 */
const Rides = require("../models/Rides");
const Users = require("../models/Users");
const Drivers = require("../models/Drivers");
const Notifications = require("../models/Notifications");
const io = require("../index");
const Trips = require("../models/Trips");
const socket = require("../index");
const moment = require("moment");
const fcmservice = require("../utils/fcmService");

/**
 * Create Ride
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    console.log(req.body);
    const ride = await Rides.create(req.body);
    if (!ride) return res.status(404).send("No Ride is created");
    res.json({ success: true, ride });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all rides
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const rides = await Rides.find()
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      });
    if (!rides) res.status(404).send("No Rides Found");
    res.json({ success: true, rides });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get ride by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const ride = await Rides.findById(rideId)
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      });

    if (!ride) return res.status(404).send("No Rides Found");
    res.json({ success: true, ride });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * Get rides by clientid
 * @param {object} req
 * @param {object} res
 */
exports.getByClientId = async (req, res) => {
  try {
    const ride = await Rides.find({ client: req.params.clientId })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      });

    if (!ride) res.status(404).send("No Rides Found");
    res.json({ success: true, ride });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get upcomingrides by clientid
 * @param {object} req
 * @param {object} res
 */
exports.getClientUpcomingRides = async (req, res) => {
  try {
    const upcomingRides = await Rides.find({
      client: req.params.clientId,
      status: "pending",
    })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      })
      .sort({ date: 1 });

    if (!upcomingRides) res.status(404).send("No rides Found");
    res.json({ success: true, upcomingRides });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get past rides
 * @param {object} req
 * @param {object} res
 */
exports.getClientPastRides = async (req, res) => {
  try {
    const pastRides = await Rides.find({
      client: req.params.clientId,
      $or: [{ status: "end" }, { status: "completed" }],
    })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      })
      .sort({ date: -1 });

    if (!pastRides) res.status(404).send("No rides Found");
    res.json({ success: true, pastRides });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get ongoing rides by clientid
 * @param {object} req
 * @param {object} res
 */

exports.getClientOngoingRides = async (req, res) => {
  try {
    const rides = await Rides.find({
      client: req.params.clientId,
      status: "start",
    })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      });

    if (!rides) return res.status(404).send("No Rides Found");
    return res.status(202).json({ success: true, rides });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update ride
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const updatedRide = await Rides.findByIdAndUpdate(rideId, req.body, {
      new: true,
    });
    if (!updatedRide) res.status(404).send("No Ride is Updated");
    res.json({ success: true, updatedRide });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete ride
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const ride = await Users.findByIdAndDelete(rideId);
    if (!ride) return res.status(404).send("No Ride deleted");
    res.json({ success: true, ride });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get rides by driverid
 * @param {object} req
 * @param {object} res
 */
exports.getByDriverId = async (req, res) => {
  try {
    const ride = await Rides.find({ driver: req.params.driverId })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      });

    if (!ride) res.status(404).send("No Rides Found");
    res.json({ success: true, ride });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get upcomingrides by driverid
 * @param {object} req
 * @param {object} res
 */
exports.getDriverUpcomingRides = async (req, res) => {
  try {
    const rides = await Rides.find({
      driver: req.params.driverId,
      status: "pending",
    })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      })
      .sort({ date: 1 });

    if (!rides) res.status(404).send("No rides Found");
    res.json({ success: true, rides });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get past rides
 * @param {object} req
 * @param {object} res
 */
exports.getDriverPastRides = async (req, res) => {
  try {
    const rides = await Rides.find({
      driver: req.params.driverId,
      $or: [{ status: "end" }, { status: "completed" }],
    })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      })
      .sort({ date: -1 });
    if (!rides) res.status(404).send("No rides Found");
    res.json({ success: true, rides });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get ongoing rides by driverid
 * @param {object} req
 * @param {object} res
 */
exports.getDriverOngoingRides = async (req, res) => {
  try {
    const rides = await Rides.find({
      driver: req.params.driverId,
      status: "start",
    })
      .populate({
        path: "client",
        populate: {
          path: "passengers",
        },
      })
      .populate("driver")
      .populate("vehicle")
      .populate({
        path: "trip",
        populate: {
          path: "quote",
          populate: {
            path: "passengers",
          },
        },
      });

    if (!rides) res.status(404).send("No Rides Found");
    res.json({ success: true, rides });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * Complete Rides
 * @param {object} req
 * @param {object} res
 */
exports.completeRide = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const feedback = req.body.feedback;
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    const findRide = await Rides.findById(rideId);
    const findTrip = await Trips.findById(findRide.trip);
    if (findRide) {
      var pubMsg = {
        verb: "published",
        actions: "retour d'information",
      }; //Message for fcm
      var pushMessage = feedback; //Notification title fcm
      const driver = await Drivers.findById(findRide.driver);
      const client = await Users.findById(findRide.client);
      fcmservice.sendPushMessage(
        driver?.fcmToken,
        "etour d'information",
        pushMessage,
        pubMsg
      );
      fcmservice.sendPushMessage(
        client?.fcmToken,
        "le client a été déposé",
        "le client a été déposé",
        "le client a été déposé"
      );

      if (io.socket) {
        io.socket.emit(`feedback${findRide.driver}`, {
          message: feedback,
        });
      }
      const notification = await Notifications.create({
        title: feedback,
        expiry_date: fifteenDays,
        receiver: findRide.driver,
      });
      await Drivers.findByIdAndUpdate(findRide.driver, {
        $push: {
          notifications: notification.id,
        },
      });
      findRide.status = "completed";
      findTrip.status = "completed";
      await findRide.save();
      await findTrip.save();
      return res
        .status(202)
        .json({ success: true, message: "Ride Updated Successfully" });
    } else
      return res
        .status(404)
        .json({ success: false, message: "RideId is not valid" });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Start Ride
 * @param {object} req
 * @param {object} res
 */
exports.startRide = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    var pubMsg = {
      verb: "published",
      actions: "Le trajet a commencé",
    }; //Message for fcm
    var pushMessage = "Le trajet a commencé"; //Notification title fcm
    const updateRide = await Rides.findByIdAndUpdate(
      rideId,
      { status: "start" },
      { new: true }
    );
    if (updateRide) {
      const driver = await Drivers.findById(updateRide.driver);
      const client = await Users.findById(updateRide.client);
      fcmservice.sendPushMessage(
        client.fcmToken,
        "Le trajet a commencé",
        pushMessage,
        pubMsg
      );
      if (io.socket) {
        io.socket.emit(`start${updateRide.client}`, {
          message: "Le trajet a commencé",
          rideData: updateRide,
        });
      }

      const notification = await Notifications.create({
        title: "Le trajet a commencé",
        expiry_date: fifteenDays,
        receiver: updateRide.client,
        driver_picture: driver.profile_pic,
      });
      await Users.findByIdAndUpdate(updateRide.client, {
        $push: {
          notifications: notification.id,
        },
      });
      return res.status(202).json({ success: true, updateRide });
    } else
      return res
        .status(404)
        .json({ success: false, message: "Invalid Ride Id" });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * End Ride
 * @param {object} req
 * @param {object} res
 */
exports.endRide = async (req, res) => {
  try {
    const rideId = req.params.rideId;
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    var pubMsg = {
      verb: "published",
      actions: "Le trajet a été terminé",
    }; //Message for fcm
    var pushMessage = "Le trajet a été terminé"; //Notification title fcm
    const updateRide = await Rides.findByIdAndUpdate(
      rideId,
      { status: "end" },
      { new: true }
    );
    if (updateRide) {
      const driver = await Drivers.findById(updateRide.driver);
      const client = await Users.findById(updateRide.client);
      fcmservice.sendPushMessage(
        client.fcmToken,
        "Le trajet a été terminé",
        pushMessage,
        pubMsg
      );
      if (io.socket) {
        io.socket.emit(`endRide${updateRide.client}`, {
          message: "Le trajet a été terminé",
          rideData: updateRide,
        });
      }
      const notification = await Notifications.create({
        title: "Le trajet a été terminé",
        expiry_date: fifteenDays,
        receiver: updateRide.client,
        driver_picture: driver.profile_pic,
      });
      await Users.findByIdAndUpdate(updateRide.client, {
        $push: {
          notifications: notification.id,
        },
      });
      const findTrip = await Trips.findById(updateRide.trip);
      findTrip.status = "completed";
      await findTrip.save();
      return res.status(202).json({ success: true, updateRide });
    } else
      return res
        .status(404)
        .json({ success: false, message: "Invalid Ride Id" });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getLatestRide = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const time = new Date();
    time.setHours(time.getHours() + 1);
    const findRide = await Rides.find({
      $and: [
        { driver: driverId },
        { date: { $gt: new Date() } },
        { date: { $lt: time } },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(1);
    if (findRide.length > 0)
      return res.status(202).json({ success: true, findRide });
    else
      return res
        .status(202)
        .json({ success: false, message: "No latest Ride Available" });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
