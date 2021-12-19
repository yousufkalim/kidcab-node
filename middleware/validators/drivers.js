/**
 * Driver validation
 * @author Arooj Ishfaq
 */
const { check, validationResult } = require("express-validator");

exports.validateDriver = [
  check("first_name", "First Name is required.").notEmpty().trim(),
  check("last_name", "Last Name is required.").notEmpty().trim(),
  check("email", "Email is required.").notEmpty().isEmail().trim(),
  check("phone", "Phone is required.").notEmpty().trim(),
  check("address", "Address is required").notEmpty().trim(),
  check("role", "Role is required").notEmpty().trim(),
  check("criminal_record", "Criminal Record is required").notEmpty().trim(),
  check("identity_card.front_side_image", "Front Side of ID Card is required")
    .notEmpty()
    .trim(),
  check("identity_card.back_side_image", "Back Side of ID Card is required")
    .notEmpty()
    .trim(),
  check("vtc_card.front_side_image", "Front Side of VTC Card is required")
    .notEmpty()
    .trim(),
  check("vtc_card.back_side_image", "Back Side of VTC Card is required")
    .notEmpty()
    .trim(),
  check(
    "green_vtc_card.front_side_image",
    "Front Side of Green VTC Card is required"
  )
    .notEmpty()
    .trim(),
  check(
    "green_vtc_card.back_side_image",
    "Back Side of Green VTC Card is required"
  )
    .notEmpty()
    .trim(),
  check(
    "driver_license_card.front_side_image",
    "Front Side of Driver License Card is required"
  )
    .notEmpty()
    .trim(),
  check(
    "driver_license_card.back_side_image",
    "Back Side of Driver License Card is required"
  )
    .notEmpty()
    .trim(),

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
