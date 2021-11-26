/**
 * Vehicle schema
 * @author Usman Haider
 */
const { Schema, model } = require("mongoose");

// Schema
const vehicleSchema = new Schema(
  {
    vehicle_name: {
      type: String,
      required: true,
    },
    number_plate: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    engine_type: {
      type: String,
      required: true,
    },
    gray_card: {
      type: String,
      required: true,
    },
    inspection_info: {
      type: String,
      required: true,
    },

    driver: {
      type: Schema.Types.ObjectId,
      ref: "drivers",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Vehicles", vehicleSchema);
