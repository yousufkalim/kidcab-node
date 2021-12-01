/**
 * Passenger CRUD controllers
 * @author Usman Haider
 */
const Passengers = require("../models/Passengers");

/**
 * Create Passenger - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const passenger = await Passengers.create(req.body);
    await passenger.save();
    res.json({ success: true, passenger });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all users
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const passengers = await Passengers.find();
    if (!passengers) return res.status(404).send("No Passengers Found");
    res.json({ success: true, users });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get user by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const passengerId = req.params.passengerId;
    const passenger = await Passengers.findById(passengerId);
    if (!passenger) return res.status(404).send("No Passenger Found");
    res.json({ success: true, passenger });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update user
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const passengerId = req.params.passengerId;
    const updatedPassenger = await Passengers.findByIdAndUpdate(
      passengerId,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedPassenger) return res.status(404).send("No Passenger Update");
    res.json({ success: true, updatedPassenger });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete user
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const passengerId = req.params.passengerId;
    const deletedPassenger = await Passengers.findByIdAndDelete(passengerId);
    if (!deletedPassenger) return res.status(404).send("No Passenger Deleted");
    res.json({ success: true, deletedPassenger });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
