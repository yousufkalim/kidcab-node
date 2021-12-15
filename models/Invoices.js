/**
 * Invoice schema
 * @author Usman Haider
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
      enum: ["pending", "paid", "late", "canceled"],
    },
    comments: {
      type: String,
    },
    trip: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "trips",
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Invoices", invoiceSchema);
