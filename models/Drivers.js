/**
 * Drivers schema
 * @author Arooj Ishfaq
 */
const { Schema, model } = require("mongoose");

// Schema
const driverSchema = new Schema(
  {
    //_id: String,
    profile_pic: { type: String },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String, required: true },
    email: { type: String, required: true },
    fcmToken: String,
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
        ref: "Vehicles",
      },
    ],
    id_card_front: { type: String, default: "" },
    id_card_back: { type: String, default: "" },
    vtc_card_front: { type: String, default: "" },
    vtc_card_back: { type: String, default: "" },
    criminal_record_image: { type: String, default: "" },
    criminal_record_date: Date,
    ris_image: { type: String, default: "" },
    ris_date: Date,
    kbis_image: { type: String, default: "" },
    kbis_date: Date,
    proRc_image: { type: String, default: "" },
    proRc_date: Date,
    license_card_front: { type: String, default: "" },
    license_card_back: { type: String, default: "" },
    kbis_extract: { type: String, default: "" },
    rib: { type: String, default: "" },
    professional_liability: { type: String, default: "" },
    insurance_civil_liability: { type: String, default: "" },

    bank_info: {
      account_number: {
        type: String,
      },
      bank_name: {
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
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "notification",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("drivers", driverSchema);
