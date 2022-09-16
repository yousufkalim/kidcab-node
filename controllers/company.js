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
    let company = await Company.findOne(); //? get first document in db.
    if (req.file) {
      req.body.logo = req.file.path;
    }

    if (company) {
      //? if company have data update it.
      await Company.findOneAndUpdate({ _id: company._id }, req.body, { new: true }).then((resp) => {
        return res.json({
          success: true,
          message: 'Company Data Updated Sucessfully',
          company: resp,
        });
      });
    } else {
      //? if company donot have data create it.
      await Company.create(req.body).then((resp) => {
        return res.json({
          success: true,
          message: 'Company Data Uploaded Sucessfully',
          company: resp,
        });
      });
    }
  } catch (err) {
    //? Error handling
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
