/**
 * Trip CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const trips = require("../controllers/trips");
const { upload } = require("../middleware/multer");
const {
  validateTrips,
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
router.post("/", validateTrips, isValidated, trips.create);

// Read
router.get("/", trips.getAll); // Get all trips at once
router.get("/:tripId", trips.getById); // Get one trip by it's id
router.get("/:tripId/:driverId", trips.accept);

// Update ride
router.put("/:tripId", trips.update); // Update a specific trip by it's id

// Delete
router.delete("/:tripId", trips.delete); // delete a specific trip by it's id

//Upcoming Rides
router.get("/upcoming/:clientId", trips.getUpcomingTrips); // Get all upcoming trips

//Past Rides
router.get("/past/:clientId", trips.getPastTrips); // Get all past trips
// Export
module.exports = router;
