/**
 * Driver CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const drivers = require("../controllers/drivers");
const { upload } = require("../middleware/multer");
const {
  validateDriver,
  isValidated,
} = require("../middleware/validators/drivers");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post Driver signup
 * @method get get all drivers
 * @method get get Driver by id
 * @method put update Driver
 * @method delete delete Driver
 */

const uploadImages = upload.fields([
  { name: "profile_pic" },
  { name: "id_card_front" },
  { name: "id_card_back" },
  { name: "vtc_card_front" },
  { name: "vtc_card_back" },
  { name: "green_card_front" },
  { name: "green_card_back" },
  { name: "license_card_front" },
  { name: "criminalRecord_image" },
  { name: "kbis_image" },
  { name: "proRC_Certificate_image" },
  { name: "restrictedInfoStatement_image" },
]);

// Create
router.post("/", uploadImages, validateDriver, isValidated, drivers.create);

//login
router.post("/login", drivers.login);

// Read
router.get("/", drivers.getAll); // Get all drivers at once
router.get("/:driverId", drivers.getById); // Get one driver by it's id

// Update
router.put("/:driverId", uploadImages, drivers.update); // Update a specific driver by it's id

// Delete
router.delete("/:driverId", drivers.delete); // delete a specific driver by it's id

//forget password
router.put("/forgot/:email", drivers.forgot);

//change password
router.put("/password/:driverId", drivers.changePassword);

// Export
module.exports = router;
