/**
 * Invoice schema
 * @author Arooj Ishfaq
 */
const { Schema, model } = require("mongoose");

// Schema
const invoiceSchema = new Schema(
  {
    invoice_title: {
      type: String,
      required: true,
    },
    issue_date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
    },
    total_price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "late", "cancelled"],
    },
    comments: {
      type: String,
    },
    client: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    trip_info: {
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
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Invoices", invoiceSchema);
