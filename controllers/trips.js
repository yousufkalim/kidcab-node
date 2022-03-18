/**
 * trips CRUD controllers
 * @author Arooj Ishfaq
 */
const Trips = require("../models/Trips");
const Drivers = require("../models/Drivers");
const Rides = require("../models/Rides");
const Users = require("../models/Users");
const Notifications = require("../models/Notifications");
const moment = require("moment");
const { findDistance, findDistance1 } = require("../utils/findDistance");
const { sendEmail } = require("../utils/sendInvite");
const { BASE_URL } = process.env;
const io = require("../index");
const fcmservice = require("../utils/fcmService");
/**
 * Create Trip
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const {
      invited_drivers,
      start_address,
      addresses,
      end_address,
      trip_type,
    } = req.body;
    const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
    const fifteenDays = new Date(daysCount); //Set date after 15days
    var pubMsg = {
      verb: "published",
      actions: "Vous avez un nouveau trajet ",
    }; //Message for fcm
    var pushMessage = "ous avez un nouveau trajet "; //Notification title fcm
    //if stetp not added by admin
    if (Object.values(addresses).length < 1) {
      const result = await findDistance(start_address, end_address);
      req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
      req.body.average_time = result.time ? result.time : "00:00";
    } else {
      //if stetp  added by admin
      const result = await findDistance1(start_address, addresses, end_address);
      req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
      req.body.average_time = result.time ? result.time : "00:00";
    }

    let dates = []; //to find date of days
    //Working according to Trip Type
    if (trip_type === "recurring") {
      const s_date = new Date(req.body.startdate); //start date
      const e_date = new Date(req.body.enddate); //end date
      let selectedDays = req.body.days; //days selected by user(monday,tuesday)
      let j = s_date;
      //setting loop index
      for (let i = 0; i < selectedDays.length; i++) {
        //this loop will run for each day
        for (; j <= e_date; j.setDate(j.getDate() + 1)) {
          //this loop will work from start to end date and find when date is repeating
          if (selectedDays[i].value === j.getDay()) {
            let serverDate = new Date(j); //taking date coming from request
            var hours = req.body.time[i].split(":"); //split hours and minutes
            serverDate.setHours(parseInt(hours[0]));
            serverDate.setMinutes(parseInt(hours[1]));
            //pushing updated date into date(arr)
            dates.push(new Date(serverDate));
          }
        }
        j = new Date(req.body.startdate); //After inner loop break this will reinitalize loop from start date
      }
    }
    //else if trip is simple
    else {
      var hours = req.body.time.split(":"); //split hours and minutes
      req.body.dates.map((date) => {
        //set each date's format
        const serverDate = new Date(date);
        serverDate.setHours(parseInt(hours[0]));
        serverDate.setMinutes(parseInt(hours[1]));
        //pushing updated date into date(arr)
        dates.push(new Date(serverDate));
      });
    }

    const createTrips = () => {
      return new Promise((resolve, reject) => {
        dates.map(async (date, index) => {
          try {
            const drivers = await Drivers.find({
              _id: { $in: invited_drivers },
            });
            req.body.invited_drivers = invited_drivers.map((driver) => ({
              driver: driver,
            }));
            //create trip for each driver with specific date
            const trip = await Trips.create({
              ...req.body,
              rides: [],
              date: date,
            });
            //creating trip
            //This map will send notification to all driver then create notification for each driver
            drivers.map(async (driver) => {
              if (driver?.fcmToken) {
                fcmservice.sendPushMessage(
                  driver.fcmToken,
                  "Demande de course",
                  pushMessage,
                  pubMsg
                );
                //store notification in db
                const notification = await Notifications.create({
                  title: "Vous avez un nouveau trajet",
                  expiry_date: fifteenDays,
                  receiver: driver.id,
                });
                //update driver with new notification
                await Drivers.findByIdAndUpdate(driver.id, {
                  $push: {
                    notifications: notification.id,
                  },
                });
              }
            });
            let datesLength = dates.length - 1;
            if (index === datesLength) {
              resolve(trip);
            }
          } catch (err) {
            console.trace("Error ----> ", err.message);
            reject(err);
          }
        });
      });
    };
    //resolving all promises
    createTrips()
      .then((response) => {
        res.json({ success: true, response });
      })
      .catch((err) => {
        console.trace("Error ----> ", err.message);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      });
  } catch (err) {
    console.trace("Error ----> ", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Accept trip
 * @param {object} req
 * @param {object} res
 */
exports.accept = async (req, res) => {
  const { tripId, driverId } = req.params;
  try {
    let trip = await Trips.findById(tripId);
    let driver = await Drivers.findById(driverId);
    const driver_id = driver._id;
    const price = trip.driver_price / trip.required_drivers;
    //creating ride when driver accepts invitation
    const ride = await Rides.create({
      price: price,
      client: trip.client,
      driver: driver_id,
      vehicle: driver.vehicles[0],
      trip: trip._id,
      date: trip.date,
    });

    if (!trip || !driver) {
      return res
        .status(404)
        .json({ success: false, message: "Trip/Driver not found" });
    } else if (trip.required_drivers <= trip.assigned_drivers.length) {
      return res
        .status(400)
        .json({ success: false, message: "Trip already booked" });
    }

    //updating trip after creating ride
    const updatedTrip = await Trips.findByIdAndUpdate(
      trip._id,
      {
        $push: { assigned_drivers: driverId, rides: ride._id },
        $pull: { invited_drivers: { driver: driverId } },
      },
      { new: true }
    );
    if (updatedTrip.assigned_drivers.length === updatedTrip.required_drivers) {
      updatedTrip.status = "confirmed";
      await updatedTrip.save();
    }

    res.json({ success: true, trip: updatedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Decline trip by driver
 * @param {object} req
 * @param {object} res
 */
exports.declineByDriver = async (req, res) => {
  try {
    let { tripId, driverId } = req.params;

    let declinedTrip = await Trips.findByIdAndUpdate(
      tripId,
      {
        $pull: {
          invited_drivers: { driver: driverId },
        },
      },
      { new: true }
    )
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");

    if (!declinedTrip) {
      return res
        .status(400)
        .json({ success: false, message: "Trip already declined" });
    }

    res.json({ success: true, declinedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all trips
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const trips = await Trips.find()
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");
    if (!trips) res.status(404).send("No Trips Found");
    res.json({ success: true, trips });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get pending trips by driver id
 * @param {object} req
 * @param {object} res
 */
exports.getPendingByDriver = async (req, res) => {
  try {
    let { driverId } = req.params;

    const trips = await Trips.find({
      "invited_drivers.driver": driverId,
      status: "pending",
    })
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers")
      .sort({ date: 1 });

    if (!trips) res.status(404).send("No Trips Found");

    res.json({ success: true, trips });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get upcoming trips/rides
 * @param {object} req
 * @param {object} res
 */

exports.getUpcomingTrips = async (req, res) => {
  try {
    const trips = await Trips.find({ client: req.params.clientId })
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers")
      .sort({ date: 1 });
    var current = moment();
    let upcomingTrips = trips.filter((a) => moment(current).isBefore(a.date));
    if (!upcomingTrips) return res.status(404).send("No Trips Found");
    res.json({ success: true, upcomingTrips });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get past trips/rides
 * @param {object} req
 * @param {object} res
 */
exports.getPastTrips = async (req, res) => {
  try {
    const trips = await Trips.find({
      client: req.params.clientId,
    })
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers")
      .sort({ date: -1 });
    var current = moment();
    let pastTrips = trips.filter((a) => moment(current).isAfter(a.date));
    if (!trips) return res.status(404).send("No Trips Found");
    res.json({ success: true, pastTrips });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get trip by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trips.findById(tripId)
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");
    if (!trip) res.status(404).send("No Trips Found");
    res.json({ success: true, trip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get trip by status
 * @param {object} req
 * @param {object} res
 */
exports.getTripsByStatus = async (req, res) => {
  try {
    const trips = await Trips.find({
      status: req.params.status === "all" ? undefined : req.params.status,
    })
      .populate("client")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");

    if (!trips) res.status(404).send("No Trips Found");
    res.json({ success: true, trips });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update trip
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    if (req.body.time) {
      var hours = req.body.time.split(":"); //split hours and minutes
      let serverDate = new Date(req.body.date); //setting server date
      serverDate.setHours(parseInt(hours[0]));
      serverDate.setMinutes(parseInt(hours[1]));
      //pushing updated date into date(arr)
      req.body.date = new Date(serverDate);
    }
    const {
      start_address,
      end_address,
      addresses,
      invited_drivers,
      assigned_drivers,
    } = req.body;
    if (invited_drivers) {
      req.body.invited_drivers = invited_drivers.map((driver) => ({
        driver: driver,
      }));
    }
    const trip = await Trips.findById(tripId);
    //if stetp not added by admin
    if (Object.values(addresses).length < 1) {
      const result = await findDistance(start_address, end_address);
      req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
      req.body.average_time = result.time ? result.time : 0;
    } else {
      //if stetp  added by admin
      const result = await findDistance1(start_address, addresses, end_address);
      req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
      req.body.average_time = result.time ? result.time : 0;
    }
    const updatedTrip = await Trips.findByIdAndUpdate(tripId, {
      ...req.body,
      assigned_drivers: assigned_drivers ? assigned_drivers : null,
    })
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");
    if (!updatedTrip) res.status(404).send("No Trip is Updated");
    res.json({ success: true, updatedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const updatedTrip = await Trips.findByIdAndUpdate(tripId, {
      ...req.body,
    })
      .populate("client")
      .populate("rides")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");
    if (!updatedTrip) res.status(404).send("No Trip is Updated");
    res.json({ success: true, updatedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete trip
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const deletedTrip = await Trips.findByIdAndDelete(tripId);
    if (!deletedTrip) res.status(404).send("No Trip is deleted");
    res.json({ success: true, deletedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete multiple trips
 * @param {object} req
 * @param {object} res
 */
exports.deleteMany = async (req, res) => {
  try {
    const { tripIds } = req.body;
    const deletedTrip = await Trips.deleteMany({ _id: { $in: tripIds } });

    res.json({ success: true, deletedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * Get Trips By Date
 * @param {object} req
 * @param {object} res
 */
exports.TripsByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    const trips = await Trips.find({
      $and: [
        { date: { $gte: new Date(start_date) } },
        { date: { $lte: new Date(end_date) } },
      ],
    })
      .populate("client")
      .populate("passengers")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");
    if (trips) return res.status(200).json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//Day Report
exports.getDayReport = async (req, res) => {
  try {
    const today = new Date();
    const lastweek = new Date().getTime() - 604800000;
    const reports = await Trips.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(lastweek),
            $lte: today,
          },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          driver_price: { $sum: "$client_price" },
          turnover: { $sum: 1 },
        },
      },
    ]);
    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Add stop to trip
exports.addStop = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trips.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not Found" });
    }
    const { addresses } = req.body;
    const result = await findDistance1(
      trip.start_address,
      addresses,
      trip.end_address
    );
    trip.distance = result.distance ? result.distance.toFixed(1) : 0;
    trip.average_time = result.time ? result.time : 0;
    trip.addresses = addresses;
    await trip.save();
    return res.json({ success: true, trip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Find remaining distance
exports.remainingDistance = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const trip = await Trips.findById(tripId);
    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: "Trip not Found" });
    }
    const { address } = req.body;
    const result = await findDistance(trip.end_address, address);
    const remainingDistance =
      parseInt(trip.distance) > parseInt(result.distance)
        ? parseInt(trip.distance) - parseInt(result.distance)
        : parseInt(result.distance) - parseInt(trip.distance);
    const remainingTime =
      parseInt(trip.average_time) > parseInt(result.time)
        ? parseInt(trip.average_time) - parseInt(result.time)
        : parseInt(result.time) - parseInt(trip.average_time);
    return res.json({
      success: true,
      remainingDistance: remainingDistance,
      remainingTime: remainingTime,
    });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
