/**
 * Notification schema
 * @author Shuja Naqvi
 */

const { Schema, model } = require("mongoose");

// Schema
const notificationSchema = new Schema(
  {
    title: String,
    receiver: String,
    expiry_date: Date,
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("notifications", notificationSchema);
