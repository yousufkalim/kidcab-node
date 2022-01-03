const { check, validationResult } = require("express-validator");

exports.validateRides = [
  // check("latitude", "latitude is Required").notEmpty().trim(),
  // check("longitude", "longitude is required").notEmpty().trim(),
  // check("status", "Status is required").notEmpty().trim(),
  check("client", "At least one Client ID is required").notEmpty().trim(),
  check("driver", "At least one Driver ID is required").notEmpty().trim(),
  check("vehicle", "At least one Vehicle ID is required").notEmpty().trim(),
  check("trip", "At least one Vehicle ID is required").notEmpty().trim(),
];

/**
 * To check if request validated successfully or not, according to our validation strategies
 * @param {object} req
 * @param {object} res
 * @param {*} next
 */
exports.isValidated = (req, res, next) => {
  const errors = validationResult(req); // Validating the request by previous middleware's strategy
  if (!errors.isEmpty()) {
    // On error
    res.status(400).send({ success: false, message: errors.array()[0] }); // Sending first error to the client from array of errors
  } else {
    // Validated successfully
    next(); // Pass the request to next middleware or controller
  }
};
