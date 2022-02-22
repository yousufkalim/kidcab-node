/**
 * Admin CRUD controllers
 * @author Arooj Ishfaq
 */
const Admin = require("../models/Admins");
const bcrypt = require("bcryptjs");
const bcryptSalt = process.env.BCRYPT_SALT || 10;
const { generateAuthToken } = require("../middleware/auth");
/**
 * Create Admin - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    let { email, password, first_name, last_name } = req.body; // Getting required fields from body
    const existingAdmin = await Admin.findOne({ email }); // Finding already existing admin

    if (existingAdmin) {
      return res
        .status(409)
        .json({ success: false, message: "Admin already exists." });
    }

    // Getting url of the image
    if (req.file) {
      req.body.profile_pic = req.file.path; // Creating a new property called photo in body object
    }

    // Creating Admin
    password = bcrypt.hashSync(password, parseInt(bcryptSalt)); // Hashing the password with salt 8
    const admin = await Admin.create({
      name: {
        first_name,
        last_name,
      },
      password,
      profile_pic: req.body.profile_pic,
      email,
    }); // Adding admin in db
    await admin.save();
    // Done
    res.json({ success: true, admin }); //Success
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Login admins
 * @param {object} req
 * @param {object} res
 */

exports.login = async (req, res) => {
  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) return res.status(404).send("Email or Password is incorrect");
    console.log(req.body);
    const validPassword = bcrypt.compareSync(req.body.password, admin.password);
    if (!validPassword)
      return res.status(401).send("Email or Password is incorrect");
    const token = await generateAuthToken(admin);
    res.json({ success: true, admin, token }); // Success
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Logout admins
 * @param {object} req
 * @param {object} res
 */

exports.logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("Logout successfully");
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Logout All admins
 * @param {object} req
 * @param {object} res
 */

exports.logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Logout All admins successfully");
  } catch (err) {
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
    const admins = await Admin.find();
    res.json({ success: true, admins });
  } catch (err) {
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
