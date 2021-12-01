/**
 * trips CRUD controllers
 * @author Usman Haider
 */
const Vehicles = require("../models/Vehicles");

/**
 * Create Vehicle
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const vehicle = await Vehicles.create(req.body);
    if (!vehicle) res.status(501).send("No vehicle is created");

    res.json({ success: true, vehicle });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all vehicles
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const vehicles = await Vehicles.find();
    if (!vehicles) res.status(404).send("No Vehicle Founds");
    res.json({ success: true, vehicles });
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
    const vehicleId = req.params.vehicleId;
    const vehicle = await Trips.findById(vehicleId);
    if (!vehicle) res.status(501).send("No Vehicle Founds");
    res.json({ success: true, vehicle });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update Vehicle
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const updatedVehicle = await Trips.findByIdAndUpdate(vehicleId, req.body, {
      new: true,
    });
    if (!updatedVehicle) res.status(501).send("No Vehicle is Updated");
    res.json({ success: true, updatedVehicle });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete Vehicle
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const vehicleId = req.params.vehicleId;
    const deletedVehicle = await Trips.findByIdAndDelete(vehicleId);
    if (!deletedVehicle) res.status(501).send("No Vehicle is deleted");
    res.json({ success: true, deletedVehicle });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
