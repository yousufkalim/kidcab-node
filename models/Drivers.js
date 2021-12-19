/**
 * Drivers schema
 * @author Usman Haider
 */
const { Schema, model } = require("mongoose");

// Schema
const driverSchema = new Schema(
  {
    profile_pic: { type: String },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    email: { type: String, required: true },
    password: {
      type: String,
      required: true,
    },
    address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    role: {
      type: String,
      enum: ["individual", "fleet_manager"],
      required: true,
    },
    company: {
      company_name: String,
      siret_number: String,
      legal_info: String,
      social_capital: String,
      vat_number: String,
      city_of_rcs: String,
    },
    vehicles: [
      {
        type: Schema.Types.ObjectId,
        ref: "vehicles",
      },
    ],
    id_card_front: String,
    id_card_back: String,
    vtc_card_front: String,
    vtc_card_back: String,
    green_card_front: String,
    green_card_back: String,
    license_card_front: String,
    license_card_back: String,

    criminal_record: {
      type: String,
    },
    bank_info: {
      account_number: {
        type: String,
      },
      bank_name: {
        type: String,
      },
      bank_address: {
        type: String,
      },
      balance: {
        type: String,
      },
      iban: {
        type: String,
      },
    },
    earnings: {
      type: Number,
    },
    services: {
      type: String,
      enum: ["monthly", "per_ride"],
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("drivers", driverSchema);
