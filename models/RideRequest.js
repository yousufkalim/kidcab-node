/**
 * Ride Request schema
 * @author Shuja Naqvi
 */
const { Schema, model } = require("mongoose");

// Schema
const riderequestSchema = new Schema(
  {
    you_are: {
      tpye: String,
    },
    journey_type: {
      type: String,
      enum: ["One Way", "Round Trip", "Journey with stages"],
    },
    journey_frequency: {
      type: String,
      enum: ["occasional", "regularl"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    email: String,
    phone: String,
    message: String,
    company_name: String,
    first_name: String,
    last_name: String,
    door_support: Boolean,
    total_children: Number,
    total_adults: Number,
    baby: Number,
    pickUp_date: Date,
    pickUp_address: String,
    distance: Number,
    pickUp_address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    destination_address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    return_date: Date,
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("ridesrequest", riderequestSchema);
