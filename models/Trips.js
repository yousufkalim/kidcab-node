/**
 * Trips schema
 * @author Usman Haider
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
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
      street_address: {
        type: String,
      },
    },
    end_address: {
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
      street_address: {
        type: String,
      },
    },
    addresses: [
      {
        Location_info: {
          latitude: {
            type: String,
          },
          longitude: {
            type: String,
          },
          street_address: {
            type: String,
          },
        },
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
          required: true,
          enum: ["accepted", "rejected", "pending", "assigned"],
        },
      },
    ],
    rides: [
      {
        type: Schema.Types.ObjectId,
        ref: "rides",
        required: true,
      },
    ],
    client: {
      type: Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    quote: {
      type: Schema.Types.ObjectId,
      ref: "quotes",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("trips", tripSchema);
