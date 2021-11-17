/**
 * Passenger schema
 * @author Usman Haider
 */
const { Schema, model } = require("mongoose");

// Schema
const driverSchema = new Schema(
  {
    name: {
      first_name: { type: String, required: true },
      last_name: {
        type: String,
        required: true,
      },
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["individual", "fleet_manager"],
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: companies,
    },
    vehicles: [
      {
        type: Schema.Types.ObjectId,
        ref: "vehicles",
      },
    ],
    identity_card: {
      front_side_image: {
        type: String,
        required: true,
      },
      back_side_image: {
        type: String,
        required: true,
      },
    },
    vtc_card: {
      front_side_image: {
        type: String,
        required: true,
      },
      back_side_image: {
        type: String,
        required: true,
      },
    },
    green_vtc_card: {
      front_side_image: {
        type: String,
        required: true,
      },
      back_side_image: {
        type: String,
        required: true,
      },
    },
    driver_license_card: {
      front_side_image: {
        type: String,
        required: true,
      },
      back_side_image: {
        type: String,
        required: true,
      },
    },
    criminal_record: {
      type: String,
      required: true,
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
        type: string,
      },
    },
    earnings: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("drivers", driverSchema);
