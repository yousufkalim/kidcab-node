const { check, validationResult } = require("express-validator");

exports.validateUsers = [
  check("first_name", "First Name is Required").notEmpty().trim(),
  check("last_name", "Last Name is required").notEmpty().trim(),
  check("cnic", "CNIC Number is required").notEmpty().trim().isNumeric(),
  check("email", "Email is Required").notEmpty().trim().isEmail(),
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
