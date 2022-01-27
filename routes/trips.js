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
 * @method get get upcoming trips
 * @method get get past trips
 */

// Create
router.post("/", validateTrips, isValidated, trips.create);

// Read
router.get("/", trips.getAll); // Get all trips at once
router.get("/getPendingByDriver/:driverId", trips.getPendingByDriver); // Get all trips at once
router.get("/:tripId", trips.getById); // Get one trip by it's id

// Update ride
router.put("/:tripId", trips.update); // Update a specific trip by it's id

//testing status route
router.get("/status/:status", trips.getTripsByStatus); // Get all trips by status

// Delete
router.delete("/:tripId", trips.delete); // delete a specific trip by it's id

//Upcoming Rides
router.get("/upcoming/:clientId", trips.getUpcomingTrips); // Get all upcoming trips

//Past Rides
router.get("/past/:clientId", trips.getPastTrips); // Get all past trips

router.get("/:tripId/:driverId", trips.accept);
router.get("/declineByDriver/:tripId/:driverId", trips.declineByDriver);

// Export
module.exports = router;
