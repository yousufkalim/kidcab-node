/**
 * Client schema
 * @author Usman Haider
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
      lat: {
        type: String,
        required: true,
      },
      lng: {
        type: String,
        required: true,
      },
      label: {
        type: String,
        required: true,
      },
      label2: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      postal_code: {
        type: String,
        required: true,
      },
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
