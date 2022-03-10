const { check, validationResult } = require("express-validator");

exports.validateQuote = [
  check("quote_number", "Quote Number is Required").notEmpty().trim(),
  check("issue_date", "issue date is required").notEmpty().isDate().trim(),
  check("quote_title", "Quote Title is required").notEmpty().trim(),
  check("total_price", "Total Price is required").notEmpty().trim().isNumeric(),
  check("vat", "VAT is required").notEmpty().trim(),
  check("status", "Status is required").notEmpty().trim(),
  check("passengers", "At least one Passenger ID is required")
    .notEmpty()
    .trim()
    .isMongoId(),
  check("client", "At least one Client ID is required")
    .notEmpty()
    .trim()
    .isMongoId(),
  // check("trip_info.start_address.lat", "start address is required")
  //   .notEmpty()
  //   .trim(),
  // check("trip_info.end_address.lat", "end address is required")
  //   .notEmpty()
  //   .trim(),
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
    res.status(400).send({ success: false, message: errors.array()[0].msg }); // Sending first error to the client from array of errors
  } else {
    // Validated successfully
    next(); // Pass the request to next middleware or controller
  }
};
