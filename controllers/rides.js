/**
 * Rides CRUD controllers
 * @author Arooj Ishfaq
 */
const Rides = require("../models/Rides");
const Notifications = require("../models/Notifications");
const io = require("../index");
const moment = require("moment");

/**
 * Create Ride
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const ride = await Rides.create(req.body);
    if (!ride) res.status(404).send("No Ride is created");

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
    const rides = await Rides.find({ client: req.params.clientId })
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

    var current = moment();
    let upcomingRides = rides.filter((a) => moment(current).isBefore(a.date));
    if (!rides) res.status(404).send("No rides Found");
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
    const rides = await Rides.find({ client: req.params.clientId })
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

    var current = moment();
    let pastRides = rides.filter((a) => moment(current).isAfter(a.date));
    if (!rides) res.status(404).send("No rides Found");
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
      status: "ongoing",
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
    const rides = await Rides.find({ driver: req.params.driverId })
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

    var current = moment();
    let upcomingRides = rides.filter((a) => moment(current).isBefore(a.date));
    if (!rides) res.status(404).send("No rides Found");
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
exports.getDriverPastRides = async (req, res) => {
  try {
    const rides = await Rides.find({ driver: req.params.driverId })
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

    var current = moment();
    let pastRides = rides.filter((a) => moment(current).isAfter(a.date));
    if (!rides) res.status(404).send("No rides Found");
    res.json({ success: true, pastRides });
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
      status: "ongoing",
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
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    const findRide = await Rides.findById(rideId);
    if (findRide) {
      if (io.socket) {
        io.socket.emit(`feedback${driver.id}`, {
          message: "Thank You for the ride",
        });
      }

      const notification = await Notifications.create({
        title: "Thank You for the ride",
        expiry_date: fifteenDays,
        receiver: driver.id,
      });
      const driverNotification = await Drivers.findByIdAndUpdate(driver.id, {
        $push: {
          notifications: notification.id,
        },
      });
      findRide.status = "completed";
      await findRide.save();
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
