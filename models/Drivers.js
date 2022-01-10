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
    id_card_front: String,
    id_card_back: String,
    vtc_card_front: String,
    vtc_card_back: String,
    criminal_record_image: String,
    criminal_record_date: Date,
    ris_image: String,
    ris_date: Date,
    kbis_image: String,
    kbis_date: Date,
    proRc_image: String,
    proRc_date: Date,
    license_card_front: String,
    license_card_back: String,

    bank_info: {
      account_number: {
        type: String,
      },
      bank_name: {
        type: String,
      },
      // bank_address: {
      //   type: String,
      // },
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
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("drivers", driverSchema);
