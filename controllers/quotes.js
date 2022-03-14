/**
 * Quotes CRUD controllers
 * @author Arooj Ishfaq
 */
const Quotes = require("../models/Quotes");

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
    console.log(req.body);
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
