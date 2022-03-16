/**
 * Driver CRUD routes
 * @author Arooj Ishfaq
 */
const router = require("express").Router();
const drivers = require("../controllers/drivers");
const { upload } = require("../middleware/multer");
const {
  validateDriver,
  validatePassword,
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
  { name: "license_card_front" },
  { name: "license_card_back" },
  { name: "criminal_record_image" },
  { name: "kbis_image" },
  { name: "proRc_image" },
  { name: "ris_image" },
  { name: "kbis_extract" },
  { name: "rib" },
  { name: "professional_liability" },
  { name: "insurance_civil_liability" },
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
router.put(
  "/password/:driverId",
  validatePassword,
  isValidated,
  drivers.changePassword
);

// Export
module.exports = router;
