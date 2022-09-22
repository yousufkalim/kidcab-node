/**
 * All the validation
 * @author Yousuf Kalim
 */
const { check, validationResult } = require("express-validator");

/*
====================
Validations
====================
*/

// You can create multiple validations strategies (Read express-validator documentation for more details)
// User Signup Validation
exports.validateUser = [
  check("name", "Name is required.").notEmpty().trim(),
  check("cnic", "CNIC is required.").notEmpty().trim().isNumeric(),
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("password", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 8 }),
  check("confirmPassword", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 8 }),
  check("phone_number", "phone_number is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 11 }),
  check("role", "Role is required.").notEmpty(),
  check("number", "Number is required.").notEmpty().isNumeric().trim(),
];

// User Signup Validation
exports.validateUserUpdate = [
  check("name", "Name is required.").notEmpty().trim(),
  check("cnic", "CNIC is required.").notEmpty().isNumeric().trim(),
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  // check("gender", "Gender is required.").notEmpty(),
  check("role", "Role is required.").notEmpty(),
  check("number", "Number is required.").notEmpty().isNumeric().trim(),
];

exports.validateRideRequest = [
  check("you_are", "you_are is required.").notEmpty().trim(),
  check("first_name", "first_name is required.").notEmpty().trim(),
  check("email", "email is required.").notEmpty().isEmail().trim(),
  check("phone", "phone is required.").notEmpty().trim(),
  check("journey_type", "journey_type is required.").isIn([
    "One Way ticket",
    "Round trip",
    "Journey with stage(s)",
  ]),
  check("days", "Days Required")
    .optional()
    .isIn([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ]),
  check("journey_frequency", "journey_frequency is required.")
    .notEmpty()
    .trim(),
  check("total_children", "total_children is required.").notEmpty(),
  check("pickUp_date", "pickUp_date is required.").notEmpty().trim(),
  check("total_children", "total_children required").notEmpty().trim(),
];

/*
======================
Result
======================
*/

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
