/**
 * trips CRUD controllers
 * @author Arooj Ishfaq
 */
const Vehicles = require("../models/Vehicles");
const Drivers = require("../models/Drivers");
var mongoose = require("mongoose");
/**
 * Create Vehicle
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    req.body.driver = JSON.parse(req.body.driver);
    const imageKeys = Object.keys(req.files);
    const data = Object.assign(
      {},
      req.body,
      ...imageKeys.map((key) => ({ [key]: req.files[key][0].path }))
    );
    const vehicle = await Vehicles.create(data);
    const { driver } = req.body;
    if (!vehicle) res.status(501).send("No vehicle is created");
    if (vehicle) {
      await Drivers.findByIdAndUpdate(driver, {
        $push: { vehicles: vehicle._id },
      });
    }
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
    const vehicles = await Vehicles.find().populate("driver");
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
    const vehicle = await Vehicles.findById(vehicleId).populate("driver");
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
    req.body.driver = JSON.parse(req.body.driver);
    if (req.files) {
      const imageKeys = Object.keys(req.files);
      const data = Object.assign(
        {},
        req.body,
        ...imageKeys.map((key) => ({ [key]: req.files[key][0].path }))
      );

      const updatedVehicle = await Vehicles.findByIdAndUpdate(vehicleId, data, {
        new: true,
      }).populate("driver");

      if (!updatedVehicle) return res.status(501).send("No Vehicle is Updated");
      return res.json({ success: true, updatedVehicle });
    }
    const updatedVehicle = await Vehicles.findByIdAndUpdate(
      vehicleId,
      req.body,
      {
        new: true,
      }
    );

    if (!updatedVehicle) return res.status(501).send("No Vehicle is Updated");
    return res.json({ success: true, updatedVehicle });
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
    const deletedVehicle = await Vehicles.findByIdAndDelete(vehicleId);
    await Drivers.findByIdAndUpdate(deletedVehicle.driver, {
      $pull: {
        vehicles: deletedVehicle._id,
      },
    });
    if (!deletedVehicle) res.status(501).send("No Vehicle is deleted");
    res.json({ success: true, deletedVehicle });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
