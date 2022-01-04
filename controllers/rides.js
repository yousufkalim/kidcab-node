/**
 * Rides CRUD controllers
 * @author Arooj Ishfaq
 */
const Rides = require("../models/Rides");
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
    const rides = await Rides.find();
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
    const ride = await Rides.findById(rideId);
    if (!ride) res.status(404).send("No Rides Found");
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
      .populate("client")
      .populate("driver")
      .populate("vehicle")
      .populate("trip");
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
exports.getUpcomingRides = async (req, res) => {
  try {
    const rides = await Rides.find({ client: req.params.clientId })
      .populate("client")
      .populate("driver")
      .populate("vehicle")
      .populate("trip");
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
exports.getPastRides = async (req, res) => {
  try {
    const rides = await Rides.find({ client: req.params.clientId })
      .populate("client")
      .populate("driver")
      .populate("vehicle")
      .populate("trip");
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
exports.getOngoingRides = async (req, res) => {
  try {
    const rides = await Rides.find({
      client: req.params.clientId,
      status: "ongoing",
    })
      .populate("client")
      .populate("driver")
      .populate("vehicle")
      .populate("trip");
    if (!rides) res.status(404).send("No Rides Found");
    res.json({ success: true, rides });
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
