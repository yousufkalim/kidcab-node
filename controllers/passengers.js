/**
 * Passenger CRUD controllers
 * @author Arooj Ishfaq
 */
const Passengers = require("../models/Passengers");
const Users = require("../models/Users");

/**
 * Create Passenger - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  console.log("passenger Create Controller");
  try {
    if (req.file) {
      req.body.profile_pic = req.file.path;
    }
    console.log(req.body);
    const passenger = await Passengers.create(req.body);
    await Users.findByIdAndUpdate(req.body.client, {
      $push: {
        passengers: passenger._id,
      },
    });

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
    const passengers = await Passengers.find().populate("client");
    if (!passengers) return res.status(404).send("No Passengers Found");
    res.json({ success: true, passengers });
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
    const passenger = await Passengers.findById(passengerId).populate("client");
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
    if (req.file) {
      req.body.profile_pic = req.file.path;
    }
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
    await Users.findByIdAndUpdate(deletedPassenger.client, {
      $pull: {
        passengers: deletedPassenger._id,
      },
    });

    if (!deletedPassenger) return res.status(404).send("No Passenger Deleted");
    res.json({ success: true, deletedPassenger });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//get passengers of a specific client
exports.getPassengerByClient = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const passenger = await Passengers.find({ client: clientId });
    if (!passenger) return res.status(404).send("No Passengers Found");
    res.json({ success: true, passenger });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
