/**
 * Admin CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const admins = require("../controllers/admins");
const { upload } = require("../middleware/multer");
const {
  validateAdmin,
  validateAdminUpdate,
  isValidated,
} = require("../middleware/validators");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post admin signup
 * @method get get all admins
 * @method get get admin by id
 * @method put update admin
 * @method delete delete admin
 */

// Create - admin Signup
router.post(
  "/",
  upload.single("image"),
  validateAdmin,
  isValidated,
  admins.create
);

// Read
router.get("/", admins.getAll); // Get all admins at once
router.get("/:adminId", admins.getById); // Get one admin by it's id

// Update
router.put("/:adminId", validateAdminUpdate, isValidated, admins.update); // Update a specific admin by it's id

// Delete
router.delete("/:adminId", admins.delete); // delete a specific admin by it's id

// Export
module.exports = router;
