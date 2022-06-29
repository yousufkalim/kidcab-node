/**
 * All api routes handle here
 * @author Arooj Ishfaq
 */
const router = require("express").Router();

// Parent Routes
router.use("/admins", require("./admins")); // All the admin routes
router.use("/users", require("./users")); // All the users routes
router.use("/passengers", require("./passengers")); // All the passengers routes
router.use("/quotes", require("./quotes")); // All the quotes routes
router.use("/trips", require("./trips")); // All the trips routes
router.use("/rides", require("./rides")); // All the rides routes
router.use("/invoices", require("./invoices")); // All the invoices routes
router.use("/drivers", require("./drivers")); // All the drivers routes
router.use("/vehicles", require("./vehicles")); // All the vehicles routes
router.use("/company", require("./company")); // company routes
router.use("/company", require("./company")); // company routes
router.use("/requests", require("./rides_request"));

// Export
module.exports = router;
