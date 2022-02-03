/**
 * User CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const rides = require("../controllers/rides");
const { upload } = require("../middleware/multer");
const {
  validateRides,
  isValidated,
} = require("../middleware/validators/rides");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post rides signup
 * @method get get all rides
 * @method get get rides by id
 * @method put update rides
 * @method get get rides by clientId
 * @method get get upcoming rides
 * @method get get past rides
 * @method get get ongoing rides
 * @method delete delete rides
 */

// Create - rides Signup
router.post("/", validateRides, isValidated, rides.create);

// Read
router.get("/", rides.getAll); // Get all rides at once
router.get("/:rideId", rides.getById); // Get one ride by it's id

// Update
router.put("/:rideId", rides.update); // Update a specific ride by it's id
//complete Ride
router.put("completeRide/:rideId", rides.completeRide); //complete ride by it's id
// getridesofclient
router.get("/client/:clientId", rides.getByClientId); // Get rides of client
// get client upcoming rides
router.get("/client/upcoming/:clientId", rides.getClientUpcomingRides);
// get client past rides
router.get("/client/past/:clientId", rides.getClientPastRides);
// Client Ongoing rides
router.get("/client/ongoing/:clientId", rides.getClientOngoingRides);

// Delete
router.delete("/:rideId", rides.delete); // delete a specific ride by it's id

// get rides of Driver
router.get("/driver/:driverId", rides.getByDriverId); // Get rides of client
// get driver upcoming rides
router.get("/driver/upcoming/:driverId", rides.getDriverUpcomingRides);
// get driver past rides
router.get("/driver/past/:driverId", rides.getDriverPastRides);
// get driver Ongoing rides
router.get("/driver/ongoing/:driverId", rides.getDriverOngoingRides);
//start Ride
router.put("/startRide/:rideId", rides.startRide);
//End Ride
router.put("/endRide/:rideId", rides.endRide);
//complete Ride
router.put("/completeRide/:rideId", rides.completeRide);
//get upcoming ride
router.get("/getLatestRide/:driverId", rides.getLatestRide);
// Export
module.exports = router;
