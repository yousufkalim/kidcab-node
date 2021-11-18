/**
 * Passenger CRUD routes
 * @author Usman Haider
 */
const router = require("express").Router();
const passengers = require("../controllers/passengers");
const { upload } = require("../middleware/multer");
const {
  validatePassenger,
  validatePassengerUpdate,
  isValidated,
} = require("../middleware/validators");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post Passenger signup
 * @method get get all passengers
 * @method get get Passenger by id
 * @method put update Passenger
 * @method delete delete Passenger
 */

// Create - Passenger Signup
router.post(
  "/",
  upload.single("image"),
  validatePassenger,
  isValidated,
  passengers.create
);

// Read
router.get("/", passengers.getAll); // Get all passengers at once
router.get("/:passengerId", passengers.getById); // Get one Passenger by it's id

// Update
router.put(
  "/:passengerId",
  validatePassengerUpdate,
  isValidated,
  passengers.update
); // Update a specific passenger by it's id

// Delete
router.delete("/:passengerId", passengers.delete); // delete a specific passenger by it's id

// Export
module.exports = router;
