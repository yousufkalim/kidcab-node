/**
 * trips CRUD controllers
 * @author Arooj Ishfaq
 */
const Trips = require("../models/Trips");

/**
 * Create Trip
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { start_address, end_address, invited_drivers, assigned_drivers } =
      req.body;
    req.body.invited_drivers = invited_drivers.map((driver) => ({
      driver: driver,
    }));

    const trip = await Trips.create({
      ...req.body,
      assigned_drivers: assigned_drivers.length === 0 ? null : assigned_drivers,
    });

    if (!trip) res.status(501).send("No trip is created");
    console.log(trip);
    res.json({ success: true, trip });
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
    req.body.invited_drivers = invited_drivers.map((driver) => ({
      driver: driver,
    }));

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
