const { check, validationResult } = require("express-validator");

exports.validateTrips = [
  // check("date", "Date is Required").notEmpty().trim().isDate(),
  check("status", "Status is Required").notEmpty().trim(),
  check("client_price", "Client Price is required")
    .notEmpty()
    .trim()
    .isNumeric(),
  check("driver_price", "Driver Price is required")
    .notEmpty()
    .trim()
    .isNumeric(),
  check("client", "At least one Client ID is required").notEmpty().trim(),
  //check("addresses", "Address is Required").notEmpty().trim(),
  check("start_address.lat", "Starting Address is Required").notEmpty().trim(),
  check("end_address.lat", "Ending Address is Required").notEmpty().trim(),
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
