/**
 * All the validation
 * @author Usman Haider
 */
const { check, validationResult } = require("express-validator");

/*
 ====================
 Validations
 ====================
 */

// You can create multiple validations strategies (Read express-validator documentation for more details)
// User Signup Validation
exports.validateAdmin = [
  check("first_name", "Name is required.").notEmpty().trim(),
  check("last_name", "Name is required.").notEmpty().trim(),
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("password", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 8 }),
];

// User Signup Validation
exports.validateAdminUpdate = [
  check("first_name", "Name is required.").notEmpty().trim(),
  check("last_name", "Name is required.").notEmpty().trim(),
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("password", "Password is required.")
    .notEmpty()
    .trim()
    .isLength({ min: 8 }),
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
