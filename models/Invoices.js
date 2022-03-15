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
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Invoices", invoiceSchema);
