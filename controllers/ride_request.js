/**
 * Admin CRUD controllers
 * @author Arooj Ishfaq
 */
const Request = require('../models/RideRequest');
const { findDistance } = require('../utils/findDistance');
/**
 * Create Admin - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    console.log(typeof req.body.door_support);
    console.log(req.body.door_support);
    if (req.body.door_support == 'Non') {
      req.body.door_support = false;
    } else {
      req.body.door_support = true;
    }

    const result = await findDistance(req.body.pickUp_address, req.body.destination_address);
    req.body.distance = result.distance ? result.distance.toFixed(1) : 0;
    const request = await Request.create(req.body);
    // Done
    res.json({ success: true, request }); //Success
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all request
 * @param {object} req
 * @param {object} res
 */
exports.getByClient = async (req, res) => {
  try {
    const request = await Request.find({ client: req.params.client }).populate('client');
    res.json({ success: true, request });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
/**
 * Get all request
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const request = await Request.find().populate('client');
    res.json({ success: true, request });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    const request = await Request.findById(requestId).populate('client'); // Finding Request by id
    res.json({ success: true, request }); // Success
  } catch (err) {
    // Error handling
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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

    res.json({ success: true, requestId }); // Success
  } catch (err) {
    // Error handling
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
