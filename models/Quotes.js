/**
 * Quotes schema
 * @author Arooj Ishfaq
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
      type: Number,
      required: true,
    },
    vat: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      required: true,
    },
    docu_sign_link: {
      type: String,
    },
    trip_info: {
      total_trips: {
        type: String,
      },
      start_date: {
        type: Date,
      },
      end_date: {
        type: Date,
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
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    comment: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Quotes", quoteSchema);
