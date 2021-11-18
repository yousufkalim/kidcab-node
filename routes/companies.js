/**
 * Companies CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const companies = require("../controllers/companies");
const { upload } = require("../middleware/multer");
const {
  validateCompanies,
  validateCompaniesUpdate,
  isValidated,
} = require("../middleware/validators");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post company signup
 * @method get get all companies
 * @method get get company by id
 * @method put update company
 * @method delete delete company
 */

// Create
router.post(
  "/",
  upload.single("image"),
  validateCompanies,
  isValidated,
  companies.create
);

// Read
router.get("/", companies.getAll); // Get all companies at once
router.get("/:companyId", companies.getById); // Get one company by it's id

// Update
router.put(
  "/:companyId",
  validateCompaniesUpdate,
  isValidated,
  companies.update
); // Update a specific company by it's id

// Delete
router.delete("/:companyId", companies.delete); // delete a specific company by it's id

// Export
module.exports = router;
