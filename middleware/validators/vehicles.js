const { check, validationResult } = require("express-validator");

exports.validateVehicle = [
  check("vehicle_name", "Vehicle Name is Required").notEmpty().trim(),
  check("brand", "Brand is required").notEmpty().trim(),
  check("model", "Model is required").notEmpty().trim(),
  check("color", "Color is required").notEmpty().trim(),
  check("engine_type", "Engine Type is required").notEmpty().trim(),
  check("gray_card", "Gray Card is required").notEmpty().trim(),
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
