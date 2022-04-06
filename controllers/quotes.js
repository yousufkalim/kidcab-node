/**
 * Quotes CRUD controllers
 * @author Arooj Ishfaq
 */
const Quotes = require("../models/Quotes");
const Admin = require("../models/Admins");
const Users = require("../models/Users");
const Company = require("../models/Company");
const fs = require("fs");
const pdf = require("pdf-creator-node");
const path = require("path");
const moment = require("moment");
const { sendQuoteEmail } = require("../utils/sendEmailQuote");
const url = process.env.BASE_URL;
/**
 * Create Quote
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    const { trip_info } = req.body;
    req.body.trip_info = JSON.parse(trip_info);
    const quote = await Quotes.create(req.body);
    if (!quote) res.status(501).send("No Quote is created");
    const user = await Users.findById(quote.client);
    const files=await CreatePdf(quote._id)
    sendQuoteEmail(user.email, files);
    // Done
    res.json({ success: true, quote });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all Quotes
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    const quotes = await Quotes.find()
      .populate("client")
      .populate("passengers");
    if (!quotes) res.status(404).send("No Quote Found");
    res.json({ success: true, quotes });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get quote by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const quoteId = req.params.quoteId;
    const quote = await Quotes.findById(quoteId);
    if (!quotes) res.status(404).send("No Quote Found");
    res.json({ success: true, quote });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update quote
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const quoteId = req.params.quoteId;
    const { trip_info } = req.body;
    req.body.trip_info = JSON.parse(trip_info);
    const quote = await Quotes.findByIdAndUpdate(quoteId, req.body, {
      new: true,
    });
    if (!quote) res.status(404).send("No Quote Updated");

    res.json({ success: true, quote });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete quote
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const quoteId = req.params.quoteId;
    const quote = await Quotes.findByIdAndDelete(quoteId);
    if (!quote) res.status(404).send("No Quote deleted");

    res.json({ success: true, quote });
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
    const { quotesIds } = req.body;
    const deletedQuote = await Quotes.deleteMany({ _id: { $in: quotesIds } });

    res.json({ success: true, deletedQuote });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get  Qoute by status
 * @param {object} req
 * @param {object} res
 */
exports.getQouteByStatus = async (req, res) => {
  try {
    const quotes = await Quotes.find({
      status: req.params.status === "all" ? undefined : req.params.status,
    })
      .populate("client")
      .populate("passengers");
    if (!quotes) res.status(404).send("Qoutes Not Found");
    res.json({ success: true, quotes });
  } catch (err) {
    console.log("Error ----> ", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get QuotesByDate By Date
 * @param {object} req
 * @param {object} res
 */
exports.QuotesByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    const qoutes = await Quotes.find({
      $and: [
        { "trip_info.start_date": { $gte: new Date(start_date) } },
        { "trip_info.end_date": { $lte: new Date(end_date) } },
      ],
    })
      .populate("client")
      .populate("passengers");
    if (qoutes) return res.status(200).json({ success: true, qoutes });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 *
 * @param {object} req
 * @param {object} res
 * @returns Exported pdf
 */

exports.ExportPdf = async (req, res) => {
  try {
    const quoteIds = req.body.quotes;
    const company = await Company.findOne();
    const admin = await Admin.findOne();
    let quotes = await Quotes.find({ _id: { $in: quoteIds } })
      .populate("client")
      .populate("passengers")
      .lean();

    if (quotes.length === 0) res.status(404).send("No Quote Found");

    let filteredQuotes = {};

    quotes.map((quote) => {
      if (!filteredQuotes[quote.client._id]) {
        filteredQuotes[quote.client._id] = [];

        // Getting unit price
        quote["unit_price"] = parseInt(quote.trip_info.unit_price).toFixed(1);

        // Adding description for a quote if not exists
        if (!quote.description || quote.description === "") {
          quote["description"] = `Trip for ${
            quote.client.first_name + " " + quote.client.last_name
          }`;
        }

        // Changing format for issue data as desired
        quote["issue_date"] = moment(quote.issue_date).format("DD/MM/YYYY");
        quote["total_price2"] = quote.total_price - parseInt(quote.vat);

        // Pushing data in the array
        filteredQuotes[quote.client._id].push(quote);
      } else {
        // Getting unit price
        quote["unit_price"] = parseInt(quote.trip_info.unit_price).toFixed(1);

        // Adding description for a quote if not exists
        if (quote.description || quote.description === "") {
          quote["description"] = `Trip for ${
            quote.client.first_name + " " + quote.client.last_name
          }`;
        }
        quote["total_price2"] = quote.total_price - parseInt(quote.vat);

        // Changing format for issue data as desired
        quote["issue_date"] = moment(quote.issue_date).format("DD/MM/YYYY");
        // Pushing data in the array
        filteredQuotes[quote.client._id].push(quote);
      }
    });

    const quoteTemplate = fs.readFileSync(
      path.join(__dirname, "../template/quote.html"),
      "utf-8"
    );
    let obj = {};
    let files = [];
    const saveFiles = Object.entries(filteredQuotes).map(([key, value]) => {
      let total_price_without_tax = 0;
      let total_price_with_tax = 0;
      let total_vat = 0;
      value.map((e) => {
        total_price_without_tax =
          total_price_without_tax + (parseInt(e.total_price) - parseInt(e.vat));
        total_price_with_tax = total_price_with_tax + parseInt(e.total_price);
        total_vat = total_vat + parseInt(e.vat);
      });
      obj = {
        quotes: value,
        admin_name: "Maxime Chevallier",
        admin_email: admin.email,
        admin_address: company.address,
        admin_company_name: company.company_name,
        quote_number: value.quote_number,
        logo: `${url}/${company.logo}`,
        total_price_without_tax: total_price_without_tax,
        total_price_with_tax: total_price_with_tax,
        VAT: total_vat,
      };
      let clientName = [];
      if (value.length > 0) {
        clientName = value[0].client.first_name + value[0].client.last_name;
      }
      const filename = Math.random() + clientName + ".pdf";
      const document = {
        html: quoteTemplate,
        data: obj,
        path: `./uploads/quotes/${filename}`,
      };

      total_price_without_tax = 0;
      total_price_with_tax = 0;
      const filepath = `${process.env.BASE_URL}/uploads/quotes/${filename}`;
      files.push(filepath);

      return pdf.create(document, {
        formate: "A4",
        orientation: "portrait",
        border: "10mm",
      });
    });

    await Promise.all(saveFiles);

    res.status(200).json({ success: true, files });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deletePdf = async (req, res) => {
  const filename = req.body.file;
  try {
    fs.unlinkSync(path.join(__dirname, `../uploads/quotes/${filename}`));
    return res.status(200).json({ success: true });

    //file removed
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//Create Pdf Function

const CreatePdf=async(quoteId)=>{
  const company = await Company.findOne();
    const admin = await Admin.findOne();
    let quotes = await Quotes.findById(quoteId)
      .populate("client")
      .populate("passengers")
      .lean();

    if (quotes.length === 0) res.status(404).send("No Quote Found");

    let filteredQuotes = {};
    filteredQuotes[quotes.client._id] = [];
        // Getting unit price
        quotes["unit_price"] = parseInt(quotes?.trip_info?.unit_price).toFixed(1);
        // Adding description for a quote if not exists
        if (quotes.description || quotes.description === "") {
          quotes["description"] = `Trip for ${
            quotes.client.first_name + " " + quotes.client.last_name
          }`;
        }
        quotes["total_price2"] = quotes.total_price - parseInt(quotes.vat);
        // Changing format for issue data as desired
        quotes["issue_date"] = moment(quotes.issue_date).format("DD/MM/YYYY");
        // Pushing data in the array
        filteredQuotes[quotes.client._id].push(quotes);

    const quoteTemplate = fs.readFileSync(
      path.join(__dirname, "../template/quote.html"),
      "utf-8"
    );
    let obj = {};
    let files = [];
    const saveFiles = Object.entries(filteredQuotes).map(([key, value]) => {
      let total_price_without_tax = 0;
      let total_price_with_tax = 0;
      let total_vat = 0;
      value.map((e) => {
        total_price_without_tax =
          total_price_without_tax + (parseInt(e.total_price) - parseInt(e.vat));
        total_price_with_tax = total_price_with_tax + parseInt(e.total_price);
        total_vat = total_vat + parseInt(e.vat);
      });
      obj = {
        quotes: value,
        admin_name: "Maxime Chevallier",
        admin_email: admin.email,
        admin_address: company.address,
        admin_company_name: company.company_name,
        quote_number: value.quote_number,
        logo: `${url}/${company.logo}`,
        total_price_without_tax: total_price_without_tax,
        total_price_with_tax: total_price_with_tax,
        VAT: total_vat,
      };
      let clientName = [];
      if (value.length > 0) {
        clientName = value[0].client.first_name + value[0].client.last_name;
      }
      const filename = Math.random() + clientName + ".pdf";
      const document = {
        html: quoteTemplate,
        data: obj,
        path: `./uploads/quotes/${filename}`,
      };

      total_price_without_tax = 0;
      total_price_with_tax = 0;
      const filepath = `${process.env.BASE_URL}/uploads/quotes/${filename}`;
      files.push(filepath);
      return pdf.create(document, {
        formate: "A4",
        orientation: "portrait",
        border: "10mm",
      });
    });

    await Promise.all(saveFiles);

   return files;
}
