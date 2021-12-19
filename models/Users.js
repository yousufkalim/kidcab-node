/**
 * Client schema
 * @author Arooj Ishfaq
 */
const { Schema, model } = require("mongoose");

// Schema
const clientSchema = new Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },

    phone_number: {
      type: String,
    },
    address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    siret_number: {
      type: String,
    },
    intra_community: {
      type: String,
    },
    passengers: [
      {
        type: Schema.Types.ObjectId,
        ref: "passengers",
      },
    ],
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
    cnic: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 8,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("users", clientSchema);
