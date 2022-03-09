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
    const invoices = await Invoices.find()
      .populate({
        path: "trip",
        populate: { path: "client" },
      })
      .populate({
        path: "trip",
        populate: { path: "quote" },
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
 * Get Invoice by status
 * @param {object} req
 * @param {object} res
 */
exports.getInvoicesByStatus = async (req, res) => {
  try {
    // const tripId = req.params.tripId;
    const invoices = await Invoices.find({
      status: req.params.status === "all" ? undefined : req.params.status,
    })
      .populate({
        path: "trip",
        populate: { path: "client" },
      })
      .populate({
        path: "trip",
        populate: { path: "quote" },
      });
    if (!invoices) res.status(404).send("No invoices Found");
    res.json({ success: true, invoices });
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
    res.json({ success: true, updatedInvoice });
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

/**
 * Delete multiple trips
 * @param {object} req
 * @param {object} res
 */
exports.deleteMany = async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    const deletedInvoice = await Invoices.deleteMany({
      _id: { $in: invoiceIds },
    });

    res.json({ success: true, deletedInvoice });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Invoice by overdue
 * @param {object} req
 * @param {object} res
 */
exports.getLateInvoices = async (req, res) => {
  try {
    const invoices = await Invoices.find({ status: "late" }).count();
    if (invoices < 1) return res.status(404).json("No invoices Found");
    else return res.json({ success: true, invoices: invoices });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
