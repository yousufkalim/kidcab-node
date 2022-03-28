/**
 * User CRUD controllers
 * @author Arooj Ishfaq
 */
const { sendEmail } = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");
const bcryptSalt = process.env.BCRYPT_SALT || 10;
const Users = require("../models/Users");
const { generateAuthToken } = require("../middleware/auth");
const Passengers = require("../models/Passengers");
/**
 * Create User - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    let { email, password, bank_info } = req.body;
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
    if (Object.values(req.body.address).length > 0) {
      req.body.address = JSON.parse(req.body.address);
    }

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
    const validPassword = bcrypt.compareSync(req.body.password, user.password);
    if (!validPassword)
      return res.status(401).send("Email or Password is incorrect");
    user.fcmToken = req.body.fcmToken;
    await user.save();
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

    if (req.file) {
      req.body.profile_pic = req.file.path;
    }
    if (req.body.bank_info) {
      req.body.bank_info = JSON.parse(bank_info);
    }
    if (req.body.address) {
      req.body.address = JSON.parse(address);
    }

    const user = await Users.findOneAndUpdate({ _id: userId }, req.body, {
      new: true,
    }); // Updating the user

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User does not Found, could not update",
      });
    }

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
    const passengers = await Passengers.deleteMany({
      _id: { $in: user.passengers },
    });
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

//update password
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are not same",
      });
    }

    let user = await Users.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatched = bcrypt.compareSync(oldPassword, user.password);

    if (!isMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid old Password" });
    }

    // Generate token
    user.password = bcrypt.hashSync(newPassword, parseInt(bcryptSalt));

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//forget password recoverycons
exports.forgot = async (req, res) => {
  try {
    let { email } = req.params;
    let user = await Users.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generating random password
    let randomPassword = Math.random().toString(36).slice(-8);
    //let newPassword = req.body.password;

    // Sending email to user
    sendEmail(email, randomPassword)
      .then(async () => {
        // If email is sent then we have to update the password in db
        user.password = await bcrypt.hash(randomPassword, parseInt(bcryptSalt));
        await user.save();

        // Done
        res.json({ success: true, message: "Email sent successfully" });
      })
      .catch((err) => {
        // Error handling
        console.log("Error ----> ", err);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      });
  } catch (err) {
    // Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
