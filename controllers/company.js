/**
 ** company Controller
 * @author Arooj
 */
const Company = require("../models/Company");

/**
 ** Get company page data
 * @param {object} req
 * @param {object} res
 */
exports.getData = async (req, res) => {
  try {
    //? Find Data
    let company = await Company.findOne();
    res.json({ success: true, company: company || {} });
  } catch (err) {
    //? Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 ** Create / Update company page data
 * @param {object} req
 * @param {object} res
 */
exports.createUpdate = async (req, res) => {
  try {
    let company = await Company.findOne(); //? get first document in db.

    if (company) {
      //? if company have data update it.
      await Company.findOneAndUpdate(req.body).then(() => {
        return res.json({
          success: true,
          message: "Company Data Updated Sucessfully",
        });
      });
    } else {
      //? if company donot have data create it.
      await Company.create(req.body).then(() => {
        return res.json({
          success: true,
          message: "Company Data Uploaded Sucessfully",
        });
      });
    }
  } catch (err) {
    //? Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 ** Delete company page data
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    await Company.findOneAndDelete().then(() => {
      //? find first document in db and delete it
      return res.json({
        success: true,
        message: "Company Data Deleted Sucessfully",
      });
    });
  } catch (err) {
    //? Error handling
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
