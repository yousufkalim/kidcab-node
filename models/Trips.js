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
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "cancelled", "completed"],
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
    client_price: {
      type: Number,
      required: true,
    },
    driver_price: {
      type: Number,
      required: true,
    },
    required_drivers: {
      type: Number,
    },

    assigned_drivers: [{ type: Schema.Types.ObjectId, ref: "drivers" }],
    invited_drivers: [
      {
        driver: { type: Schema.Types.ObjectId, ref: "drivers" },
        price: { type: Number },
        status: {
          type: String,
          enum: ["accepted", "rejected", "pending", "assigned"],
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
    quote: {
      type: Schema.Types.ObjectId,
      ref: "Quotes",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("trips", tripSchema);
