/**
 * Notification schema
 * @author Shuja Naqvi
 */

const { Schema, model } = require("mongoose");

// Schema
const notificationSchema = new Schema(
  {
    title: String,
    user: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    expiry_date: Date,
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("notifications", notificationSchema);
