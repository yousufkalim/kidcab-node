/**
 ** Home Screen routes
 * @author Najam Ul Saqib
 */
const router = require("express").Router();
const company = require("../controllers/company");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/multer");

/**
 ** Routes
 * @method get get home Screen data
 * @method post create or update home Screen data
 * @method delete Delete home Screen data
 *
 */

//* Read
router.get("/", company.getData); //? Get company data
router.post("/", upload.single("logo"), auth, company.createUpdate); //? Create / Update company.

//* Export
module.exports = router;
