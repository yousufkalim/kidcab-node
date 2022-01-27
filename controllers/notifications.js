/**
 * Notifications CRUD controllers
 * @author Shuja Naqvi
 */
 const Notifications = require("../models/notifications");
 const Users=require("../models/Users")
 
 
 /**
  * Get all Notifications
  * @param {object} req
  * @param {object} res
  */
 exports.getAll = async (req, res) => {
   try {
     const notifications = await Notifications.find({user:req.params.userId})
     if (!notifications) return res.status(404).send("Invoices does not found");
     return res.json({ success: true, invoices });
   } catch (err) {
     console.log("Error ----> ", err);
     res.status(500).json({ success: false, message: "Internal server error" });
   }
 };
 
 /**
  * Get notification by id
  * @param {object} req
  * @param {object} res
  */
 exports.getById = async (req, res) => {
   try {
     const notificationId = req.params.notificationId;
     const notification = await Notifications.findById(notificationId);
     if (!notification) return res.status(404).send("notification not found");
     else return res.json({ success: true, notification });
   } catch (err) {
     console.log("Error ----> ", err);
     res.status(500).json({ success: false, message: "Internal server error" });
   }
 };
 

 /**
  * Delete Notification
  * @param {object} req
  * @param {object} res
  */
 exports.delete = async (req, res) => {
   try {
     const notificationId = req.params.notificationId;
     const deletedNotification = await Notifications.findByIdAndDelete(notificationId);
     if (!deletedNotification) return res.status(404).json("Can't delete Notification");
     res.json({ success: true, deletedNotification });
   } catch (err) {
     console.log("Error ----> ", err);
     res.status(500).json({ success: false, message: "Internal server error" });
   }
 };
 


 /**
  * Delete Notification
  * @param {object} req
  * @param {object} res
  */


  exports.deleteAll = async (req, res) => {
    try {
      const userId = req.params.userId;
      const deletedNotification = await Notifications.deleteMany({user:userId});
      if (!deletedNotification) return res.status(404).json("Can't delete Notification");
      res.json({ success: true, deletedNotification });
    } catch (err) {
      console.log("Error ----> ", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
