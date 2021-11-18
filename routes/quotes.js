/**
 * Quote CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const quotes = require("../controllers/quotes");
const { upload } = require("../middleware/multer");
const {
  validateQuote,
  validateQuoteUpdate,
  isValidated,
} = require("../middleware/validators");

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
router.put("/:quoteId", validateQuoteUpdate, isValidated, quotes.update); // Update a specific quote by it's id

// Delete
router.delete("/:quoteId", quotes.delete); // delete a specific quote by it's id

// Export
module.exports = router;
