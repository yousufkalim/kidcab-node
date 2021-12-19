/**
 * Admin CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const admins = require("../controllers/admins");
const { upload } = require("../middleware/multer");
const { auth } = require("../middleware/auth");
const {
  validateAdmin,
  validateAdminUpdate,
  isValidated,
} = require("../middleware/validators/admins");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post admin signup
 * @method get get all admins
 * @method get get admin by id
 * @method put update admin
 * @method delete delete admin
 */

// Create - admin Signup
router.post("/", upload.single("image"), admins.create);

router.post("/login", admins.login);
router.post("/logout", auth, admins.logout);
router.post("/logout/all", auth, admins.logoutAll);

// Read
router.get("/", auth, admins.getAll); // Get all admins at once
router.get("/:adminId", auth, admins.getById); // Get one admin by it's id

// Update
router.put("/:adminId", auth, admins.update); // Update a specific admin by it's id

// Delete
router.delete("/:adminId", auth, admins.delete); // delete a specific admin by it's id

// Export
module.exports = router;
