/**
 * Driver CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const drivers = require("../controllers/drivers");
const { upload } = require("../middleware/multer");
const {
  validateDriver,
  validateDriverUpdate,
  isValidated,
} = require("../middleware/validators");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post Driver signup
 * @method get get all drivers
 * @method get get Driver by id
 * @method put update Driver
 * @method delete delete Driver
 */

// Create
router.post(
  "/",
  upload.single("image"),
  validateDriver,
  isValidated,
  drivers.create
);

// Read
router.get("/", drivers.getAll); // Get all drivers at once
router.get("/:driverId", drivers.getById); // Get one driver by it's id

// Update
router.put("/:driverId", validateDriverUpdate, isValidated, drivers.update); // Update a specific driver by it's id

// Delete
router.delete("/:driverId", drivers.delete); // delete a specific driver by it's id

// Export
module.exports = router;
