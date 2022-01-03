/**
 * Rides schema
 * @author Arooj Ishfaq
 */
const { Schema, model } = require("mongoose");

// Schema
const rideSchema = new Schema(
  {
    _id: String,
    route_info: {
      latitude: String,
      longitude: String,
    },
    status: {
      type: String,
      enum: ["pending", "ongoing", "cancelled", "completed"],
      default: "pending",
    },
    price: {
      type: Number,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "drivers",
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "vehicles",
      required: true,
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: "trips",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("rides", rideSchema);
