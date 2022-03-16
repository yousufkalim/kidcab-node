/**
 * User CRUD controllers
 * @author Arooj Ishfaq
 */
const Invoices = require("../models/Invoices");
const Admin = require("../models/Admins");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const path = require("path");
const moment = require("moment");

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
    const invoices = await Invoices.find().populate("client");
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
 * Get invoice by Clientid
 * @param {object} req
 * @param {object} res
 */
exports.getByClient = async (req, res) => {
  try {
    const clientId = req.params.clinetId;
    const invoices = await Invoices.find().populate("client");
    const clientInvoices = invoices.filter((i) => {
      if (i.client) {
        if (i.client._id == clientId) {
          return i;
        }
      }
    });
    if (!clientInvoices) res.status(404).send("Invoices does not found");
    res.json({ success: true, clientInvoices });
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
    }).populate("client");

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
 * Update invoice
 * @param {object} req
 * @param {object} res
 */
exports.setStatus = async (req, res) => {
  try {
    let { value, invoices } = req.body;
    let updatedinvoices = [];
    for (let i = 0; i < invoices.length; i++) {
      let invoice = await Invoices.findByIdAndUpdate(
        invoices[i]._id,
        { status: value },
        {
          new: true,
        }
      );
      updatedinvoices.push(invoice);
    }
    return res.json({ success: true, updatedinvoices });
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

exports.ExportPdf = async (req, res) => {
  try {
    const invoiceIds = req.body.invoices;
    const admin = await Admin.findOne();
    let invoices = await Invoices.find({ _id: { $in: invoiceIds } })
      .populate("client")
      .lean();
    if (invoices.length === 0) res.status(404).send("No invoice Found");

    let filteredInvoices = {};
    let total_price = 0;
    invoices.map((invoice) => {
      if (!filteredInvoices[invoice.client._id]) {
        filteredInvoices[invoice.client._id] = [];

        // Changing format for issue data as desired
        invoice["issue_date"] = moment(invoice.issue_date).format(
          "DD MMMM YYYY"
        );

        // Calculating Total Price
        total_price = total_price + invoice.total_price;
        filteredInvoices[invoice.client._id].push(invoice);
      } else {
        // Changing format for issue data as desired
        invoice["issue_date"] = moment(invoice.issue_date).format(
          "DD MMMM YYYY"
        );

        // Calculating Total Price
        total_price = total_price + invoice.total_price;

        filteredInvoices[invoice.client._id].push(invoice);
      }
    });

    const invoiceTemplate = fs.readFileSync(
      path.join(__dirname, "../template/invoice.html"),
      "utf-8"
    );
    let obj = {};
    let files = [];
    Object.entries(filteredInvoices).map(async ([key, value]) => {
      obj = {
        invoices: value,
        admin_name: admin.name.first_name + " " + admin.name.last_name,
        admin_email: admin.email,
        admin_address: admin.address,
        admin_company_name: admin.company_name,
        total_price: total_price,
      };
      let clientName = [];
      if (value.length > 0) {
        clientName = value[0].client.first_name + value[0].client.last_name;
      }
      const filename = Math.random() + clientName + ".pdf";
      const document = {
        html: invoiceTemplate,
        data: obj,
        path: `./uploads/invoice/${filename}`,
      };
      await pdf
        .create(document, {
          formate: "A4",
          orientation: "portrait",
          border: "10mm",
        })
        .then((e) => {
          total_price = 0;
          const filepath = `${process.env.BASE_URL}/uploads/invoice/${filename}`;
          files.push(filepath);
          return res.status(200).json({ success: true, files });
        });
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deletePdf = async (req, res) => {
  const filename = req.body.file;
  try {
    fs.unlinkSync(path.join(__dirname, `../uploads/invoice/${filename}`));
    return res.status(200).json({ success: true });

    //file removed
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
