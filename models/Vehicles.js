/**
 * Vehicle schema
 * @author Arooj Ishfaq
 */
const { Schema, model } = require("mongoose");

// Schema
const vehicleSchema = new Schema(
  {
    vehicle_name: {
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
    graycard: String,
    inspection_info: String,
    inspection_expiry_date: Date,
    registration_card: String,
    graycard: String,
    graycard_expiry_date: Date,
    inspection_date: Date,
    insurance_certificate: String,
    insurance_expiry_date: Date,
    driver: {
      type: Schema.Types.ObjectId,
      ref: "drivers",
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Vehicles", vehicleSchema);
