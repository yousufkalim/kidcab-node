/**
 * Driver CRUD controllers
 * @author Arooj Ishfaq
 */
const Drivers = require('../models/Drivers');
const Vehicles = require('../models/Vehicles');
const bcrypt = require('bcryptjs');
const bcryptSalt = process.env.BCRYPT_SALT || 10;
const { generateAuthToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');
/**
 * Create Driver
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingDriver = await Drivers.findOne({ email });
    if (existingDriver) {
      return res.status(400).json({ success: false, message: 'Driver already exists' });
    }
    if (req.body.bank_info) {
      req.body.bank_info = JSON.parse(req.body.bank_info);
    }
    if (req.body.address) {
      req.body.address = JSON.parse(req.body.address);
    }
    if (req.body.company) {
      req.body.company = JSON.parse(req.body.company);
    }
    if (req.body.vehicles) {
      req.body.vehicles = JSON.parse(req.body.vehicles);
    }
    req.body.password = bcrypt.hashSync(password, parseInt(bcryptSalt));
    if (req.files) {
      const imageKeys = Object.keys(req.files);

      const data = Object.assign({}, req.body, ...imageKeys.map((key) => ({ [key]: req.files[key][0].path })));
      const driver = await Drivers.create(data);
      if (driver) return res.json({ success: true, files: driver });
    }
    const driver = await Drivers.create(req.body);
    if (driver) return res.json({ success: true, files: driver });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all drivers
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const drivers = await Drivers.find().populate('vehicles');
    res.json({ success: true, drivers });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Login API for driver
 */

exports.login = async (req, res) => {
  try {
    const driver = await Drivers.findOne({ email: req.body.email }).populate('vehicles');
    if (!driver) return res.status(404).send('Driver not found');

    const validPassword = bcrypt.compareSync(req.body.password, driver.password);
    console.log(req.body);
    driver.fcmToken = req.body.fcmToken;
    await driver.save();
    if (!validPassword) return res.status(401).send('Password is incorrect');

    const token = await generateAuthToken(driver);
    res.json({ success: true, driver, token }); // Success
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    const driver = await Drivers.findById(driverId).populate('vehicles');
    res.json({ success: true, driver });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    const findDriver = await Drivers.findByIdAndUpdate(driverId);
    const { email, bank_info, address, vehicles } = req.body;
    if (email) {
      if (email !== findDriver.email) {
        const existingDriver = await Drivers.findOne({ email: email });
        if (existingDriver) {
          return res.status(404).json({ success: false, message: 'This Email is already taken' });
        }
      }
    }
    if (req.body.bank_info) {
      req.body.bank_info = JSON.parse(bank_info);
    }

    if (req.body.company) {
      req.body.company = JSON.parse(req.body.company);
    }
    if (req.body.address != undefined) {
      req.body.address = JSON.parse(address);
    }
    if (req.body.vehicles) {
      req.body.vehicles = JSON.parse(vehicles);
      let testxx = req.body.vehicles;
      //It will filter Vechicles
      let oldVechicles = findDriver.vehicles.filter((o1) => !testxx.some((o2) => o1 == o2));
      let newVechicles = testxx.filter((o1) => !findDriver.vehicles.some((o2) => o1 == o2));
      await Vehicles.bulkWrite([
        {
          updateMany: {
            filter: { _id: oldVechicles },
            update: { $unset: { driver: '' } },
          },
        },
      ]);
      await Vehicles.bulkWrite([
        {
          updateMany: {
            filter: { _id: newVechicles },
            update: { driver: driverId },
          },
        },
      ]);
    }
    if (req.files) {
      const imageKeys = Object.keys(req.files);

      const data = Object.assign({}, req.body, ...imageKeys.map((key) => ({ [key]: req.files[key][0].path })));
      const updatedDriver = await Drivers.findByIdAndUpdate(driverId, data, {
        new: true,
      }).populate('vehicles');
      if (!updatedDriver) return res.status(404).send("Rating can't update");
      return res.json({ success: true, updatedDriver });
    }
    const updatedDriver = await Drivers.findByIdAndUpdate(driverId, req.body, {
      new: true,
    }).populate('vehicles');

    if (!updatedDriver) return res.status(404).send("Rating can't update");
    res.json({ success: true, updatedDriver });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
//updateDriver
/**
 * Update driver
 * @param {object} req
 * @param {object} res
 */
exports.updateDriver = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    const { email, bank_info, address, vehicles } = req.body;
    if (req.body.bank_info) {
      req.body.bank_info = JSON.parse(bank_info);
    }

    if (req.body.company) {
      req.body.company = JSON.parse(req.body.company);
    }
    if (req.body.address != undefined) {
      req.body.address = JSON.parse(address);
    }
    if (req.body.vehicles) {
      req.body.vehicles = JSON.parse(vehicles);
    }
    const updatedDriver = await Drivers.findByIdAndUpdate(driverId, req.body, {
      new: true,
    }).populate('vehicles');

    if (!updatedDriver) return res.status(404).send("Rating can't update");
    res.json({ success: true, updatedDriver });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
/**
 * Delete driver
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const companyId = req.params.driverId;
    const company = await Drivers.findByIdAndDelete(companyId);
    if (!company) {
      return res.status(404).send({
        success: false,
        message: 'User does not Found, could not delete',
      });
    }
    await Vehicles.deleteMany({
      _id: { $in: company.vehicles },
    });
    res.json({ success: true, company });
  } catch (err) {
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//update password
exports.changePassword = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password are not same',
      });
    }

    let driver = await Drivers.findById(driverId);

    if (!driver) {
      return res.status(404).json({ success: false, message: 'driver not found' });
    }

    const isMatched = bcrypt.compareSync(oldPassword, driver.password);

    if (!isMatched) {
      return res.status(400).json({ success: false, message: 'Invalid old Password' });
    }

    // Generate password hash
    driver.password = bcrypt.hashSync(newPassword, parseInt(bcryptSalt));

    await driver.save();

    res.json({ success: true, driver });
  } catch (err) {
    // Error handling
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//forget password recovery
exports.forgot = async (req, res) => {
  try {
    let { email } = req.params;
    let driver = await Drivers.findOne({ email });

    if (!driver) {
      return res.status(404).json({ success: false, message: 'driver not found' });
    }

    // Generating random password
    let randomPassword = Math.random().toString(36).slice(-8);
    //let newPassword = req.body.password;

    // Sending email to driver
    sendEmail(email, randomPassword)
      .then(async () => {
        // If email is sent then we have to update the password in db
        driver.password = await bcrypt.hash(randomPassword, parseInt(bcryptSalt));
        await driver.save();

        // Done
        res.json({ success: true, message: 'Email sent successfully' });
      })
      .catch((err) => {
        // Error handling
        console.log('Error ----> ', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
      });
  } catch (err) {
    // Error handling
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
