/**
 * Admin schema
 * @author Usman Haider
 */
const mongoose = require("mongoose");

// Schema
const adminSchema = new mongoose.Schema(
  {
    name: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
    },
    profile_pic: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = mongoose.model("admins", adminSchema);
