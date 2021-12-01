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
exports.validateCompany = [
  check("company_name", "Company Name is required.").notEmpty().trim(),
  check("logo", "Logo is required.").notEmpty().trim(),
  check("siret_number", "SIRET Number is required.").notEmpty().trim(),
  check("legal_info", "Legal Info is required.").notEmpty().trim(),
  check("social_capital", "Social Capital is required.").notEmpty().trim(),
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
