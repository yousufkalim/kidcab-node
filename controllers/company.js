/**
 ** company Controller
 * @author Arooj
 */
const Company = require('../models/Company');

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
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 ** Create / Update company page data
 * @param {object} req
 * @param {object} res
 */
exports.createUpdate = async (req, res) => {
  try {
    if (req.file) {
      req.body.logo = req.file.path;
    }
    let company = await Company.findOneAndUpdate(req.body, { new: true }); //? get first document in db.
    if (!company) {
      company = await Company.create(req.body);
      return res.json({
        success: true,
        message: 'Company Data Updated Sucessfully',
        company: company,
      });
    }
    return res.json({
      success: true,
      message: 'Company Data Updated Sucessfully',
      company: company,
    });
  } catch (err) {
    //? Error handling
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
