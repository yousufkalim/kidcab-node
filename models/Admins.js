/**
 * Admin schema
 * @author Arooj Ishfaq
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
    phone_number: {
      type: Number,
    },
    password: {
      type: String,
      minlength: 8,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

adminSchema.methods.toJSON = function () {
  const admin = this;
  const adminObject = admin.tosObject();
  delete adminObject.password;
  delete adminObject.tokens;
  return adminObject;
};

// Model
module.exports = mongoose.model("admins", adminSchema);
