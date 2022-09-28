/**
 * Admin CRUD controllers
 * @author Arooj Ishfaq
 */
const Request = require("../models/RideRequest");
const { findDistance } = require("../utils/findDistance");
/**
 * Create Admin - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { total_children, total_adults, baby } = req.body;

    if (req.body.door_support === "Non") {
      req.body.door_support = false;
    } else {
      req.body.door_support = true;
    }
    const result = await findDistance(
      req.body.pickUp_address,
      req.body.destination_address
    );
    req.body.distance = result.distance
      ? parseInt(result.distance).toFixed(2)
      : 0;
    req.body.rideTime = result.duration ? result.duration : 0;
    //rideTime

    const timeFormat = toHHMMSS(req.body.rideTime);
    const passengers = total_children + total_adults + baby;

    if (req.body.distance === 0) {
      req.body.passengers = passengers;
      req.body.status = "not answer";
      const request = await Request.create(req.body);
      // Done
      return res.json({ success: true, request, contact: true }); //Success
    }

    if (req.body.distance > 18 || passengers > 6 || req.body.rideTime > 3600) {
      req.body.passengers = passengers;
      req.body.rideTime = timeFormat;
      const request = await Request.create(req.body);
      // Done
      return res.json({ success: true, request, contact: true }); //Success
    }
    if (passengers <= 3) {
      if (req.body.distance <= 6 || req.body.rideTime <= 1800) {
        req.body.price = 45;
      } else if (
        (req.body.distance > 6 && req.body.distance <= 12) ||
        req.body.rideTime <= 2700
      ) {
        req.body.price = 55;
      } else if (
        (req.body.distance > 12 && req.body.distance <= 18) ||
        req.body.rideTime <= 3600
      ) {
        req.body.price = 75;
      }
    }

    if (passengers > 3 && passengers <= 6) {
      if (req.body.distance <= 10 && req.body.rideTime <= 2400) {
        req.body.price = 75;
      } else if (
        req.body.distance > 10 &&
        req.body.distance <= 18 &&
        req.body.rideTime <= 3600
      ) {
        req.body.price = 90;
      } else {
        req.body.passengers = passengers;
        req.body.rideTime = timeFormat;
        const request = await Request.create(req.body);
        // Done
        return res.json({ success: true, request, contact: true }); //Success
      }
    }
    req.body.passengers = passengers;
    req.body.rideTime = timeFormat;
    const request = await Request.create(req.body);
    // Done
    res.json({ success: true, request, contact: false }); //Success
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all request
 * @param {object} req
 * @param {object} res
 */
exports.getByClient = async (req, res) => {
  try {
    const request = await Request.find({ client: req.params.client }).populate(
      "client"
    );
    res.json({ success: true, request });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * Get all request
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const request = await Request.find().populate("client");
    res.json({ success: true, request });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Request by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const requestId = req.params.requestId; // Getting Request id from URL parameter
    const request = await Request.findById(requestId).populate("client"); // Finding Request by id
    res.json({ success: true, request }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update Request
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const requestId = req.params.requestId; // Getting request id from URL parameter
    const request = await Request.findByIdAndUpdate(requestId, req.body, {
      new: true,
    }); // Updating the request
    res.json({ success: true, request }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete Request
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const requestId = req.params.requestId; // Getting request id from URL parameter
    const request = await Request.findByIdAndDelete(requestId); // Deleting the request

    res.json({ success: true, request }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Time Format
const toHHMMSS = (val) => {
  var sec_num = parseInt(val, 10); // don't forget the second param
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
};
