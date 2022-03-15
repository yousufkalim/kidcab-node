/**
 * Quote CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const quotes = require("../controllers/quotes");
const { upload } = require("../middleware/multer");
const {
  validateQuote,
  isValidated,
} = require("../middleware/validators/quotes");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post quote signup
 * @method get get all quotes
 * @method get get quote by id
 * @method put update quote
 * @method delete delete quote
 */

// Create - quote Signup
router.post("/", validateQuote, isValidated, quotes.create);

// Read
router.get("/", quotes.getAll); // Get all quotes at once
router.get("/:quoteId", quotes.getById); // Get one quote by it's id

// Update
router.put("/:quoteId", quotes.update); // Update a specific quote by it's id
//get
router.get("/status/:status", quotes.getQouteByStatus); // Get all qoutes by status

// Delete
router.delete("/pdf", quotes.deletePdf);
router.delete("/deleteMany", quotes.deleteMany);
router.delete("/:quoteId", quotes.delete); // delete a specific quote by it's id
//filter
router.post("/QuotesByDate/", quotes.QuotesByDate);
router.post("/export_pdf/", quotes.ExportPdf);
// Export
module.exports = router;
