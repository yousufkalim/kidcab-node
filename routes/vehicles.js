/**
 * Vehicle CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const vehicles = require("../controllers/vehicles");
const { upload } = require("../middleware/multer");
const {
  validateVehicle,
  validateVehicleUpdate,
  isValidated,
} = require("../middleware/validators");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post vehicle signup
 * @method get get all vehicles
 * @method get get vehicle by id
 * @method put update vehicle
 * @method delete delete vehicle
 */

// Create
router.post(
  "/",
  upload.single("image"),
  validateVehicle,
  isValidated,
  vehicles.create
);

// Read
router.get("/", vehicles.getAll); // Get all vehicles at once
router.get("/:vehicleId", vehicles.getById); // Get one vehicle by it's id

// Update
router.put("/:vehicleId", validateVehicleUpdate, isValidated, vehicles.update); // Update a specific vehicle by it's id

// Delete
router.delete("/:vehicleId", vehicles.delete); // delete a specific vehicle by it's id

// Export
module.exports = router;
