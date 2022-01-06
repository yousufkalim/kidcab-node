/**
 * Vehicle CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const vehicles = require("../controllers/vehicles");
const {
  validateVehicle,
  isValidated,
} = require("../middleware/validators/vehicles");
const { upload } = require("../middleware/multer");
const uploadImages = upload.fields([
  { name: "number_plate" },
  { name: "insurance_certificate" },
  { name: "inspection_info" },
]);

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post vehicle signup
 * @method get get all vehicles
 * @method get get vehicle by id
 * @method put update vehicle
 * @method delete delete vehicle
 */

// Create
router.post("/", uploadImages, validateVehicle, isValidated, vehicles.create);

// Read
router.get("/", vehicles.getAll); // Get all vehicles at once
router.get("/:vehicleId", vehicles.getById); // Get one vehicle by it's id

// Update
router.put("/:vehicleId", vehicles.update); // Update a specific vehicle by it's id

// Delete
router.delete("/:vehicleId", vehicles.delete); // delete a specific vehicle by it's id

// Export
module.exports = router;
