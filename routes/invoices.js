/**
 * Invoice CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const invoices = require("../controllers/invoices");
const { upload } = require("../middleware/multer");
const {
  validateInvoice,
  validateInvoiceUpdate,
  isValidated,
} = require("../middleware/validators/invoices");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post Invoice signup
 * @method get get all invoices
 * @method get get Invoice by id
 * @method put update Invoice
 * @method delete delete Invoice
 */

// Create - Invoice Signup
router.post("/", invoices.create);

// Read
router.get("/", invoices.getAll); // Get all invoices at once
router.get("/:invoiceId", invoices.getById); // Get one invoice by it's id

// Update
router.put("/:invoiceId", invoices.update); // Update a specific invoice by it's id

// Delete
router.delete("/:invoiceId", invoices.delete); // delete a specific invoice by it's id

// Export
module.exports = router;
