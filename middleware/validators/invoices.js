/**
 * Invoices validation
 * @author Arooj Ishfaq
 */
const { check, validationResult } = require("express-validator");

/*
  ====================
  Validations
  ====================
  */

exports.validateInvoice = [
  check("invoice_title", "Invoice Title is required.").notEmpty().trim(),
  check("issue_date", "Issue Date is required.").notEmpty().trim().isDate(),
  check("trip", "Trip ID is required.").notEmpty().trim().isMongoId(),
  check("total_price", "Total Price is required.")
    .notEmpty()
    .trim()
    .isNumeric(),
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
    res.status(400).send({ success: false, message: errors.array()[0].msg }); // Sending first error to the client from array of errors
  } else {
    // Validated successfully
    next(); // Pass the request to next middleware or controller
  }
};
