/**
 * User CRUD controllers
 * @author Arooj Ishfaq
 */
const Invoices = require("../models/Invoices");

/**
 * Create Invoice
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const invoice = await Invoices.create(req.body);
    await invoice.save();
    res.json({ success: true, invoice });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all invoices
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const invoices = await Invoices.find().populate({
      path: "trip",
      populate: { path: "client" },
    });
    if (!invoices) res.status(404).send("Invoices does not found");
    res.json({ success: true, invoices });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get invoice by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const invoiceId = req.params.userId;
    const invoice = await Invoices.findById(invoiceId);
    if (!invoice) res.status(404).send("Invoices does not found");
    res.json({ success: true, invoice });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update invoice
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const updatedInvoice = await Invoices.findByIdAndUpdate(
      invoiceId,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedInvoice) return res.status(404).send("Rating can't update");
    res.json({ success: true, user });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete invoice
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const deletedInvoice = await Invoices.findByIdAndDelete(invoiceId);
    if (!deletedInvoice) return res.status(404).send("Can't delete invoice");
    res.json({ success: true, deletedInvoice });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
