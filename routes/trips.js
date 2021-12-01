/**
 * Trip CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const trips = require("../controllers/trips");
const { upload } = require("../middleware/multer");
const {
  validateTrip,
  validateTripUpdate,
  isValidated,
} = require("../middleware/validators/trips");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post trip signup
 * @method get get all trips
 * @method get get trip by id
 * @method put update trip
 * @method delete delete trip
 */

// Create
router.post("/", trips.create);

// Read
router.get("/", trips.getAll); // Get all trips at once
router.get("/:tripId", trips.getById); // Get one trip by it's id

// Update
router.put("/:tripId", trips.update); // Update a specific trip by it's id

// Delete
router.delete("/:tripId", trips.delete); // delete a specific trip by it's id

// Export
module.exports = router;
