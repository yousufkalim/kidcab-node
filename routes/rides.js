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
 * @method delete delete rides
 */

// Create - rides Signup
router.post("/", validateRides, isValidated, rides.create);

// Read
router.get("/", rides.getAll); // Get all rides at once
router.get("/:rideId", rides.getById); // Get one ride by it's id

// Update
router.put("/:rideId", rides.update); // Update a specific ride by it's id

// getridesofclient
router.get("/client/:clientId", rides.getByClientId); // Get rides of client

// get upcoming rides
router.get("/upcoming/:clientId", rides.getUpcomingRides);

// get past rides
router.get("/past/:clientId", rides.getPastRides);

// get Ongoing rides
router.get("/Ongoing/:clientId", rides.getOngoingRides);
// Delete
router.delete("/:rideId", rides.delete); // delete a specific ride by it's id

// Export
module.exports = router;
