/**
 * Company CRUD controllers
 * @author Usman Haider
 */
const Companies = require("../models/Companies");

/**
 * Create Company - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const company = await Companies.create(req.body);

    res.json({ success: true, company });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all companies
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const companies = await Companies.find();
    res.json({ success: true, companies });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get company by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const company = await Companies.findById(companyId);
    res.json({ success: true, company });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update company
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const updatedCompany = await Companies.findByIdAndUpdate(
      companyId,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedCompany) return res.status(404).send("Rating can't update");

    res.json({ success: true, company });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete company
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const company = await Companies.findByIdAndDelete(companyId);
    res.json({ success: true, company });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
