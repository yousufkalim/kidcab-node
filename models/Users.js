/**
 * Client schema
 * @author Usman Haider
 */
const mongoose = require("mongoose");

// Schema
const clientSchema = new mongoose.Schema(
  {
    name: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
    },
    profile_pic: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    address: {
      type: String,
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
        type: string,
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
module.exports = mongoose.model("users", clientSchema);
