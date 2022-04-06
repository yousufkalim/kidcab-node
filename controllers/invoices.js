/**
 * User CRUD controllers
 * @author Arooj Ishfaq
 */
const Invoices = require("../models/Invoices");
const Admin = require("../models/Admins");
const Users = require("../models/Users");
const Company = require("../models/Company");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const path = require("path");
const moment = require("moment");
const { sendInvoiceEmail } = require("../utils/sendEmailInvoice");
const url = process.env.BASE_URL;

/**
 * Create Invoice
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { trip_info } = req.body;
    req.body.trip_info = JSON.parse(trip_info);
    const invoice = await Invoices.create(req.body);
    await invoice.save();
    const user = await Users.findById(invoice.client);
    const files=await InvoicePdf(invoice._id)
    sendInvoiceEmail(user.email, files);
    res.json({ success: true, invoice,files });
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
    const company = await Company.findOne();
    let invoices = await Invoices.find({ _id: { $in: invoiceIds } })
      .populate("client")
      .lean();
    if (invoices.length === 0) res.status(404).send("No invoice Found");

    let filteredInvoices = {};
    invoices.map((invoice) => {
      if (!filteredInvoices[invoice.client._id]) {
        filteredInvoices[invoice.client._id] = [];

        // Changing format for issue data as desired
        invoice["issue_date"] = moment(invoice.issue_date).format("DD/MM/YYYY");
        filteredInvoices[invoice.client._id].push(invoice);
      } else {
        // Changing format for issue data as desired
        invoice["issue_date"] = moment(invoice.issue_date).format("DD/MM/YYYY");
        filteredInvoices[invoice.client._id].push(invoice);
      }
    });
    
    const invoiceTemplate = fs.readFileSync(
      path.join(__dirname, "../template/invoice.html"),
      "utf-8"
    );
    let obj = {};
    let files = [];
    const saveFiles = Object.entries(filteredInvoices).map(([key, value]) => {
      let total = 0;
      value.map((e) => {
        total = total + e.total_price;
      });

      obj = {
        invoices: value,
        admin_name: "Maxime Chevallier",
        admin_email: admin.email,
        admin_address: company.address,
        admin_company_name: company.company_name,
        total_price: total,
        logo: `data:image/png;base64,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`,
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

      let total_price = 0;
      const filepath = `${process.env.BASE_URL}/uploads/invoice/${filename}`;
      files.push(filepath);
      return pdf.create(document, {
        formate: "A4",
        orientation: "portrait",
        border: "10mm",
      });
    });

    await Promise.all(saveFiles);
    return res.status(200).json({ success: true, files });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//Pdf
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

/**
 * Get InvoiceByDate By Date
 * @param {object} req
 * @param {object} res
 */
exports.InvoiceByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    const invoices = await Invoices.find({
      $and: [
        { issue_date: { $gte: new Date(start_date) } },
        { issue_date: { $lte: new Date(end_date) } },
      ],
    }).populate("client");
    if (invoices) return res.status(200).json({ success: true, invoices });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



//Create Invoice Pdf
const InvoicePdf=async(invoiceId)=>{

  const admin = await Admin.findOne();
    const company = await Company.findOne();
    let invoice = await Invoices.findById( invoiceId )
      .populate("client")
      .lean();
    if (invoice.length === 0) res.status(404).send("No invoice Found");

    let filteredInvoices = {};
    filteredInvoices[invoice.client._id] = [];
        // Changing format for issue data as desired
      invoice["issue_date"] = moment(invoice.issue_date).format("DD/MM/YYYY");
      filteredInvoices[invoice.client._id].push(invoice);
    const invoiceTemplate = fs.readFileSync(
      path.join(__dirname, "../template/invoice.html"),
      "utf-8"
    );
    let obj = {};
    let files = [];
    const saveFiles = Object.entries(filteredInvoices).map(([key, value]) => {
      let total = 0;
      value.map((e) => {
        total = total + e.total_price;
      });
      obj = {
        invoices: value,
        admin_name: "Maxime Chevallier",
        admin_email: admin.email,
        admin_address: company.address,
        admin_company_name: company.company_name,
        total_price: total,
        logo: `data:image/png;base64,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`,
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
      let total_price = 0;
      const filepath = `${process.env.BASE_URL}/uploads/invoice/${filename}`;
      files.push(filepath);
      return pdf.create(document, {
        formate: "A4",
        orientation: "portrait",
        border: "10mm",
      });
    });
    await Promise.all(saveFiles);
    return  files ;
}