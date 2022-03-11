/**
 * Invoice CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const invoices = require("../controllers/invoices");
const { upload } = require("../middleware/multer");
const {
  validateInvoice,
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
router.post("/", validateInvoice, isValidated, invoices.create);

// Read
router.get("/", invoices.getAll); // Get all invoices at once
router.get("/:invoiceId", invoices.getById); // Get one invoice by it's id
router.get("/getByClient/:clinetId", invoices.getByClient); //Get-Invoice by ClientId
// Update
router.put("/:invoiceId", invoices.update); // Update a specific invoice by it's id

// Delete
router.delete("/deleteMany", invoices.deleteMany);
router.delete("/:invoiceId", invoices.delete); // delete a specific invoice by it's id

//testing status route
router.get("/status/:status", invoices.getInvoicesByStatus); // Get all trips by status

//get Late Invoices
router.post("/getLateInvoices/", invoices.getLateInvoices); // Get all trips by status

// Export
module.exports = router;
