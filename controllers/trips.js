/**
 * trips CRUD controllers
 * @author Arooj Ishfaq
 */
const Trips = require("../models/Trips");
const Drivers = require("../models/Drivers");
const Rides = require("../models/Rides");
const moment = require("moment");
const { sendEmail } = require("../utils/sendInvite");
const { BASE_URL } = process.env;
/**
 * Create Trip
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { invited_drivers } = req.body;
    const drivers = await Drivers.find({ _id: { $in: invited_drivers } });

    req.body.invited_drivers = invited_drivers.map((driver) => ({
      driver: driver,
    }));

    const trip = await Trips.create({ ...req.body, rides: [] }); //creating trip

    //sending invites to driver
    const sendEmails = drivers.map((driver) => {
      return sendEmail(
        driver.email,
        `${BASE_URL}/api/trips/${trip._id}/${driver._id}`
      );
    });

    //resolving all promises
    Promise.all(sendEmails)
      .then((response) => {
        res.json({ success: true, response });
      })
      .catch((err) => {
        console.log("Email Error ----> ", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      });
  } catch (err) {
    console.log("Error ----> ", err);
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
      },
      { new: true }
    );

    res.json({ success: true, trip: updatedTrip });
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
      .populate({
        path: "quote",
        populate: {
          path: "passengers",
        },
      })
      .populate("rides")
      .populate({
        path: "invited_drivers",
        populate: {
          path: "driver",
        },
      })
      .populate("assigned_drivers");
    if (!trips) res.status(501).send("No Trip Founds");
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
    const trips = await Trips.find({ client: req.params.clientId });
    var current = moment();

    let upcomingTrips = trips.filter((a) => moment(current).isBefore(a.date));
    if (!trips) return res.status(501).send("No Trip Founds");

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
    const trips = await Trips.find({ client: req.params.clientId });
    var current = moment();

    let pastTrips = trips.filter((a) => moment(current).isAfter(a.date));

    if (!trips) {
      return res.status(501).send("No Trip Founds");
    }

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
    const trip = await Trips.findById(tripId);
    if (!trip) res.status(501).send("No Trip Founds");
    res.json({ success: true, trip });
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
    const { start_address, end_address, invited_drivers, assigned_drivers } =
      req.body;
    if (invited_drivers) {
      req.body.invited_drivers = invited_drivers.map((driver) => ({
        driver: driver,
      }));
    }
    console.log("DRIVERS INVITED :)--------", req.body.invited_drivers);
    const updatedTrip = await Trips.findByIdAndUpdate(tripId, {
      ...req.body,
      assigned_drivers: assigned_drivers ? assigned_drivers : null,
    });
    if (!updatedTrip) res.status(501).send("No Trip is Updated");
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
    if (!deletedTrip) res.status(501).send("No Trip is deleted");
    res.json({ success: true, deletedTrip });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
