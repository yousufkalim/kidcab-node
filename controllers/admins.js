/**
 * Admin CRUD controllers
 * @author Usman Haider
 */
const Admin = require("../models/Admins");
const bcrypt = require("bcryptjs");
const bcryptSalt = process.env.BCRYPT_SALT || 10;

/**
 * Create Admin - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    let { email, password, confirmPassword } = req.body; // Getting required fields from body
    const existingAdmin = await Amin.findOne({ email }); // Finding already existing admin

    // Extra Validations
    if (existingAdmin) {
      // If we found existing admin in db
      return res
        .status(409)
        .json({ success: false, message: "Admin already exists." });
    } else if (password !== confirmPassword) {
      // Passwords not same
      return res.status(400).json({
        success: false,
        message: "Password and Confirm Password are not same.",
      });
    }

    // Getting url of the image
    if (req.file) {
      req.body.profile_pic = req.file.path; // Creating a new property called photo in body object
    }

    // Creating Admin
    password = bcrypt.hashSync(password, parseInt(bcryptSalt)); // Hashing the password with salt 8
    const admin = await Admin.create(req.body); // Adding admin in db
    await admin.save();
    // Done
    res.json({ success: true, admin }); //Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all admins
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const admins = await Admin.find(); // Finding all the admins from db
    res.json({ success: true, admins }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get admin by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const adminId = req.params.adminId; // Getting user id from URL parameter
    const admin = await Users.findById(adminId); // Finding user by id
    res.json({ success: true, admin }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update admin
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const adminId = req.params.adminId; // Getting admin id from URL parameter
    const admin = await Admin.findByIdAndUpdate(adminId, req.body, {
      new: true,
    }); // Updating the user
    res.json({ success: true, admin }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete admin
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const adminId = req.params.adminId; // Getting admin id from URL parameter
    const admin = await Admin.findByIdAndDelete(adminId); // Deleting the admin
    res.json({ success: true, admin }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
