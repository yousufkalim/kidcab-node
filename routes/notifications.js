/**
 * Notification routes
 * @author Shuja Naqvi
 */
const router = require("express").Router();
const notifications = require("../controllers/notifications");

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post create Notification
 * @method get get all Notification
 * @method get get Notification by id
 * @method delete delete notifications
 */

// Read
router.get("/getAll/:userId", notifications.getAll); // Get all quotes at once
router.get("/:notificationId", notifications.getById); // Get one quote by it's id
// Delete
router.delete("/:notificationId", notifications.delete); // delete a specific quote by it's id
router.delete("deleteAll/:userId",notifications.deleteAll)
// Export
module.exports = router;
