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
const Admin = require("../models/Admins");
const Company = require("../models/Company");
const { findDistance, findDistance2 } = require("../utils/findDistance");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const path = require("path");
const { sendEmail } = require("../utils/sendInvite");
const { BASE_URL } = process.env;
const io = require("../index");
const fcmservice = require("../utils/fcmService");
const url = process.env.BASE_URL;
/**
 * Create Trip
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { invited_drivers, start_address, addresses, end_address, dates } =
      req.body;
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
    } else {
      //if stetp  added by admin
      const result = await findDistance2(start_address, addresses, end_address);
      req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
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
    let tripDate = moment(trip.date).format("YYYY-MM-DD");
    let today = moment(new Date()).format("YYYY-MM-DD");
    if (new Date(tripDate) > new Date(today)) {
      return res
        .status(404)
        .json({ success: false, message: "cannot accept future trips" });
    }

    if (!trip || !driver) {
      return res
        .status(404)
        .json({ success: false, message: "Trip/Driver not found" });
    } else if (trip.required_drivers <= trip.assigned_drivers.length) {
      return res
        .status(400)
        .json({ success: false, message: "Trip already booked" });
    }
    const ride = await Rides.create({
      price: price,
      client: trip.client,
      driver: driver_id,
      vehicle: driver.vehicles[0],
      trip: trip._id,
      date: trip.date,
    });

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
      .populate({
        path: "client",
        populate: {
          path: "passengers",
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
    const { pageNumber, pageSize } = req.body;
    const trips = await Trips.find({
      status: req.params.status === "all" ? undefined : req.params.status,
    })
      .skip(pageNumber * pageSize)
      .limit(parseInt(pageSize))
      .populate("client")
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
    const totalResults = await Trips.find().countDocuments();
    res.json({ success: true, trips, totalResults });
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
    const findTrip = await Trips.findById(tripId);
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
    if (req.body.status === "pending") {
      const daysCount = new Date().getTime() + 1296000000; //To set Expiry date for notification
      const fifteenDays = new Date(daysCount); //Set date after 15days
      var pubMsg = {
        verb: "published",
        actions: "Vous avez un nouveau trajet ",
      }; //Message for fcm
      var pushMessage = "ous avez un nouveau trajet "; //Notification title fcm
      let newDriver = req.body.invited_drivers.filter(
        (o1) => !findTrip.invited_drivers.some((o2) => o1.driver == o2.driver)
      );
      const drivers = await Drivers.find({
        _id: { $in: newDriver.driver },
      });
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
    }
    const trip = await Trips.findById(tripId);
    //if stetp not added by admin
    if (Object.values(addresses).length < 1) {
      const result = await findDistance(start_address, end_address);
      req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
    } else {
      //if stetp  added by admin
      const result = await findDistance2(start_address, addresses, end_address);
      req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
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
    if (!deletedTrip) return res.status(404).send("No Trip Found");
    const rides = await Rides.deleteMany({
      _id: { $in: deletedTrip?.rides },
    });
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
    let deletedTrip;
    for (i = 0; i < tripIds.length; i++) {
      deletedTrip = await Trips.findByIdAndDelete(tripIds[i]);
      await Rides.deleteMany({
        _id: { $in: deletedTrip?.rides },
      });
    }
    return res.json({ success: true, deletedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get All Results
exports.paginationTrip = async (req, res) => {
  try {
    const { pageNumber, pageSize } = req.body;
    //Fetching results from database in descending order according to date
    const results = await Trips.find()
      .skip(pageNumber * pageSize)
      .limit(parseInt(pageSize))
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
    const totalResults = await Trips.find().countDocuments();
    res.status(200).send({ msg: "All Results", results, totalResults });
  } catch (error) {
    console.log("Error ----> ", error);
    res.status(500).send("Something Failed");
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
      .populate("assigned_drivers")
      .sort({ date: 1 });
    if (trips) return res.status(200).json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//Weekly Report
exports.getDailyReport = async (req, res) => {
  try {
    let today = new Date();
    let lastweek = today.getTime() - 604800000;
    today = moment(today).format("YYYY-MM-DD");
    lastweek = moment(lastweek).format("YYYY-MM-DD");
    const reports = await Trips.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(lastweek),
            $lte: new Date(today),
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
      { $sort: { _id: 1 } },
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
    const result = await findDistance2(
      trip.start_address,
      addresses,
      trip.end_address
    );
    trip.distance = result.distance ? result.distance.toFixed(1) : 0;
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

    return res.json({
      success: true,
      remainingDistance: remainingDistance,
    });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// //Monthly Revenue
exports.getWeeklyReport = async (req, res) => {
  try {
    let setMonday = new Date();
    setMonday.setDate(setMonday.getDate() - ((setMonday.getDay() + 6) % 7)); //set last monday
    let findMonday = setMonday.getTime() - 604800000; //start monday to the set monday
    setMonday = moment(setMonday).format("YYYY-MM-DD"); //format
    findMonday = moment(findMonday).format("YYYY-MM-DD"); //format
    const reports = await Trips.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(findMonday),
            $lte: new Date(setMonday),
          },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          client_price: { $sum: "$client_price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//Get Client Trip
exports.clientTrip = async (req, res) => {
  try {
    const clientId = req.body.client;
    console.log(clientId, "clientId");
    const trips = await Trips.find({ status: "completed", client: clientId });
    return res.json({ success: true, trips });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//5weeks Revenue
exports.getRevenue = async (req, res) => {
  try {
    let setMonday = new Date();
    setMonday.setDate(setMonday.getDate() - ((setMonday.getDay() + 6) % 7)); //set last monday
    let findMonday = setMonday.getTime() - 3024000000; //start monday to the set monday
    let Fir_week = setMonday.getTime() - 2419200000; //Fir week
  let S_week = setMonday.getTime() - 1814400000; //second week
  let T_week = setMonday.getTime() - 1209600000; //Third week
  let Fo_week = setMonday.getTime() - 604800000; //Fourth week
  let Fi_week = setMonday; //Fifth week
    setMonday = moment(setMonday).format("YYYY-MM-DD"); //format
    findMonday = moment(findMonday).format("YYYY-MM-DD"); //format
    let reports = await Trips.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(findMonday),
            $lte: new Date(setMonday),
          },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $week: "$date",
          },
          client_price: { $sum: "$client_price" },
          count: {
            $sum: { $cond: [{ $eq: ["$client_price", "none"] }, 0, 1] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    console.log(reports,"r")
    if (reports.length < 5) {
      let dates = [Fi_week, Fo_week, T_week, S_week, Fir_week];
      let Weeks = await findWeeks([dates]);
      let missingWeek = Weeks.filter(
        (o1) => !reports.some((o2) => o1 === o2._id)
      );
      missingWeek.map((e) => {
        reports.push({
          _id: e,
          client_price: 0,
          count: 0,
        });
      });
    }
    reports = reports.sort((a, b) => Number(a._id) - Number(b._id));
    return res.status(200).json({ success: true, reports });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//Find week by date
let findWeeks = async ([dates]) => {
  let weeks = dates.map((i) => {
    i = new Date(i);
    var oneJan = new Date(i.getFullYear(), 0, 1);
    // calculating number of days in given year before a given date
    var numberOfDays = Math.floor((i - oneJan) / (24 * 60 * 60 * 1000));
    // adding 1 since to current date and returns value starting from 0
    var result = Math.ceil((i.getDay() + 1 + numberOfDays) / 7);
    return result;
  });
  return weeks;
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @returns Exported pdf
 */

exports.ExportPdf = async (req, res) => {
  try {
    const tripsIds = req.body.trips;
    const company = await Company.findOne();
    const admin = await Admin.findOne();
    let trips = await Trips.find({ _id: { $in: tripsIds } })
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
      .lean();

    if (trips.length === 0) res.status(404).send("No Trip Found");

    const tripTemplate = fs.readFileSync(
      path.join(__dirname, "../template/trips.html"),
      "utf-8"
    );
    let filteredTrips={};
    trips.map((trip) => {
      if (!filteredTrips[trip.client._id]) {
        filteredTrips[trip.client._id] = [];

        // Changing format for issue data as desired
        trip["date"] = moment(trip.date).format("DD/MM/YYYY");
        filteredTrips[trip.client._id].push(trip);
      } else {
        // Changing format for issue data as desired
        trip["date"] = moment(trip.date).format("DD/MM/YYYY");
        filteredTrips[trip.client._id].push(trip);
      }
    });
    let files = [];
    let obj={}
    const saveFiles = Object.entries(filteredTrips).map(([key, value]) => {
      obj = {
      trip: value,
      admin_name: "Maxime Chevallier",
      admin_email: admin.email,
      admin_address: company.address,
      admin_company_name: company.company_name,
      logo: `${url}/${company.logo}`,
    };

      let clientName = [];
      if (value.length > 0) {
        clientName = value[0].client.first_name + value[0].client.last_name;
      }
      const filename = Math.random() + clientName + ".pdf";
 const document = {
      html: tripTemplate,
      data: obj,
      path: `./uploads/trips/${filename}`,
    };
      const filepath = `${process.env.BASE_URL}/uploads/trips/${filename}`;
      files.push(filepath);
      return pdf.create(document, {
        formate: "A4",
        orientation: "portrait",
        border: "10mm",
      });
    });

    await Promise.all(saveFiles);
    return res.status(200).json({ success: true, files });

  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
