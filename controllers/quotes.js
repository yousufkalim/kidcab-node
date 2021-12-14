/**
 * Quotes CRUD controllers
 * @author Usman Haider
 */
const Quotes = require("../models/Quotes");

/**
 * Create Quote
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    console.log("creating quote...");
    const { trip_info } = req.body;
    req.body.trip_info = JSON.parse(trip_info);
    console.log(req.body);
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
