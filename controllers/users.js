/**
 * User CRUD controllers
 * @author Arooj Ishfaq
 */
const bcrypt = require("bcryptjs");
const bcryptSalt = process.env.BCRYPT_SALT || 10;
const Users = require("../models/Users");
const { generateAuthToken } = require("../middleware/auth");
/**
 * Create User - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    console.log("user created");
    let { email, password, bank_info, address } = req.body;
    const existingUser = await Users.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists." });
    }

    if (req.file) {
      req.body.profile_pic = req.file.path;
    }
    req.body.bank_info = JSON.parse(bank_info);
    req.body.address = JSON.parse(address);

    req.body.password = bcrypt.hashSync(password, parseInt(bcryptSalt));
    const NewUser = await Users.create(req.body);

    // Done
    res.json({ success: true, NewUser });
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Login API for client app-backend
 */

exports.login = async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (!user) return res.status(404).send("Email or Password is incorrect");
    console.log(user.password);
    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword)
      return res.status(401).send("Email or Password is incorrect");
    const token = await generateAuthToken(user);
    res.json({ success: true, user, token }); // Success
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all users
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const users = await Users.find().populate("passengers");
    res.json({ success: true, users });
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get user by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const userId = req.params.userId; // Getting user id from URL parameter
    const user = await Users.findById(userId); // Finding user by id
    res.json({ success: true, user }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update user
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const userId = req.params.userId;
    let { bank_info, address } = req.body;
    console.log("user update body", req.body);

    if (req.file) {
      req.body.profile_pic = req.file.path;
    }
    if (req.body.bank_info) {
      req.body.bank_info = JSON.parse(bank_info);
    }
    if (req.body.address) {
      req.body.address = JSON.parse(address);
    }

    const user = await Users.findByIdAndUpdate(userId, req.body, { new: true }); // Updating the user
    if (!user)
      res.status(404).send({
        success: false,
        message: "User does not Found, could not update",
      });
    res.json({ success: true, user }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete user
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const userId = req.params.userId; // Getting user id from URL parameter
    const user = await Users.findByIdAndDelete(userId); // Deleting the user
    if (!user)
      res.status(404).send({
        success: false,
        message: "User does not Found, could not delete",
      });
    res.json({ success: true, user }); // Success
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
