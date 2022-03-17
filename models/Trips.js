/**
 * Trips schema
 * @author Arooj Ishfaq
 */
const { Schema, model } = require("mongoose");

// Schema
const tripSchema = new Schema(
  {
    date: {
      type: Date,
    },
    average_time: String,
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "cancelled", "completed"],
    },
    required_drivers: {
      type: Number,
      default: "1",
    },
    start_address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    end_address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    addresses: [
      {
        lat: String,
        lng: String,
        label: String,
        label2: String,
        city: String,
        postal_code: String,
      },
    ],
    distance: Number,
    client_price: {
      type: Number,
      required: true,
    },
    driver_price: {
      type: Number,
      required: true,
    },
    assigned_drivers: [{ type: Schema.Types.ObjectId, ref: "drivers" }],
    invited_drivers: [
      {
        driver: { type: Schema.Types.ObjectId, ref: "drivers" },
        price: { type: Number },
        status: {
          type: String,
          enum: ["accepted", "rejected", "pending", "assigned"],
          default: "pending",
        },
      },
    ],
    rides: [
      {
        type: Schema.Types.ObjectId,
        ref: "rides",
      },
    ],
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    passengers: [
      {
        type: Schema.Types.ObjectId,
        ref: "passengers",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("trips", tripSchema);
