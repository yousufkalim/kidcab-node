/**
 * Rides CRUD controllers
 * @author Usman Haider
 */
const Rides = require("../models/Rides");

/**
 * Create Ride
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const ride = await Rides.create(req.body);
    if (!ride) res.status(501).send("No Ride is created");

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
    if (!rides) res.status(501).send("No Ride Founds");
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
    if (!ride) res.status(501).send("No Ride Founds");
    res.json({ success: true, ride });
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
    if (!updatedRide) res.status(501).send("No Ride is Updated");
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
