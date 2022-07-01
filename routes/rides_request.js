/**
 * Ride rEQUEST  routes
 * @author Shuja Naqvi
 */
const router = require("express").Router();
const request = require("../controllers/ride_request.js");
const {
  validateRideRequest,
  isValidated,
} = require("../middleware/validators");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post create request
 * @method get get all quotes
 * @method get get request by id
 * @method put update request
 * @method delete delete request
 */

// Create - request
router.post("/", request.create);

// Read
router.get("/", request.getAll); // Get all request at once
router.get("/getByClient/:clientId", request.getByClient); // Get all request at once
router.get("/:requestId", request.getById); // Get one request by it's id

// Update
router.put("/:requestId", request.update); // Update a specific request by it's id
//Delete
router.delete("/:requestId", request.delete); // Update a specific request by it's id
//get
// Export
module.exports = router;
