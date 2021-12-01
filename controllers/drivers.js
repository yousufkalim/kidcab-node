/**
 * Driver CRUD controllers
 * @author Usman Haider
 */
const Drivers = require("../models/Drivers");

/**
 * Create Driver
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const driver = await Drivers.create(req.body);
    await driver.save();
    // Done
    res.json({ success: true, driver });
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all drivers
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const drivers = await Drivers.find();
    res.json({ success: true, drivers });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get driver by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const driver = await Drivers.findById(driverId);
    res.json({ success: true, driver });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update driver
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const updatedDriver = await Users.findByIdAndUpdate(driverId, req.body, {
      new: true,
    });
    if (!updatedDriver) return res.status(404).send("Rating can't update");
    res.json({ success: true, updatedDriver });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete driver
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const company = await Users.findByIdAndDelete(companyId);
    res.json({ success: true, company });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
