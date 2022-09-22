/**
 * Admin schema
 * @author Arooj Ishfaq
 */
const mongoose = require("mongoose");

// Schema
const adminSchema = new mongoose.Schema(
  {
    name: { first_name: String, last_name: String },

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
  const adminObject = admin.toObject();
  delete adminObject.password;
  delete adminObject.tokens;
  return adminObject;
};

// Model
module.exports = mongoose.model("admins", adminSchema);
