/**
 * Quotes schema
 * @author Usman Haider
 */
const { Schema, model } = require("mongoose");

// Schema
const quoteSchema = new Schema(
  {
    quote_number: {
      type: String,
      required: true,
    },
    issue_date: {
      type: Date,
      required: true,
    },
    quote_title: {
      type: String,
      required: true,
    },
    total_price: {
      type: String,
      required: true,
    },
    vat: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
    },
    docu_sign_link: {
      type: String,
    },
    trip_info: {
      total_trips: {
        type: String,
      },
      total_passengers: {
        type: String,
      },
      start_date: {
        type: Date,
      },
      end_date: {
        type: Date,
      },
      start_address: {
        type: String,
      },
      end_address: {
        type: String,
      },
    },
    passengers: [
      {
        type: Schema.Types.ObjectId,
        required: true,
      },
    ],
    client_id: {
      type: Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Quotes", quoteSchema);
