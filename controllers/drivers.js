/**
 * Driver CRUD controllers
 * @author Arooj Ishfaq
 */
const Drivers = require("../models/Drivers");
const bcrypt = require("bcryptjs");
const bcryptSalt = process.env.BCRYPT_SALT || 10;
const { generateAuthToken } = require("../middleware/auth");
/**
 * Create Driver
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { email, password, bank_info, address, company, vehicles } = req.body;
    //console.log(address);
    req.body.bank_info = JSON.parse(bank_info);
    req.body.address = JSON.parse(address);
    if (company) {
      req.body.company = JSON.parse(company);
    }
    req.body.vehicles = JSON.parse(vehicles);

    req.body.password = bcrypt.hashSync(password, parseInt(bcryptSalt));
    const imageKeys = Object.keys(req.files);

    const data = Object.assign(
      {},
      req.body,
      ...imageKeys.map((key) => ({ [key]: req.files[key][0].path }))
    );

    const driver = await Drivers.create(data);

    if (driver) res.json({ success: true, files: driver });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all drivers
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const drivers = await Drivers.find().populate("vehicles");
    res.json({ success: true, drivers });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Login API for driver
 */

exports.login = async (req, res) => {
  try {
    const driver = await Drivers.findOne({ email: req.body.email });
    if (!driver) return res.status(404).send("Email or Password is incorrect");
    console.log(driver.password);
    const validPassword = bcrypt.compareSync(
      req.body.password,
      driver.password
    );
    if (!validPassword)
      return res.status(401).send("Email or Password is incorrect");
    const token = await generateAuthToken(driver);
    res.json({ success: true, driver, token }); // Success
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
/**
 * Get driver by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const driver = await Drivers.findById(driverId).populate("vehicles");
    res.json({ success: true, driver });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update driver
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const { bank_info, address, company, vehicles } = req.body;
    req.body.bank_info = JSON.parse(bank_info);
    req.body.address = JSON.parse(address);
    if (company) {
      req.body.company = JSON.parse(company);
    }
    req.body.vehicles = JSON.parse(vehicles);
    const imageKeys = Object.keys(req.files);

    const data = Object.assign(
      {},
      req.body,
      ...imageKeys.map((key) => ({ [key]: req.files[key][0].path }))
    );

    const updatedDriver = await Drivers.findByIdAndUpdate(driverId, data, {
      new: true,
    });
    if (!updatedDriver) return res.status(404).send("Rating can't update");
    res.json({ success: true, updatedDriver });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete driver
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const company = await Drivers.findByIdAndDelete(companyId);
    res.json({ success: true, company });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
