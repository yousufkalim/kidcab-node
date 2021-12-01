/**
 * Rides schema
 * @author Usman Haider
 */
const { Schema, model } = require("mongoose");

// Schema
const rideSchema = new Schema(
  {
    route_info: {
      latitude: { type: String, required: true },
      longitude: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "ongoing", "cancelled", "completed"],
    },
    price: {
      type: Number,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "clients",
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
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("rides", rideSchema);
