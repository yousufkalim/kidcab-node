/**
 * Passenger schema
 * @author Usman Haider
 */
const { Schema, model } = require("mongoose");

// Schema
const passengerSchema = new Schema(
  {
    name: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
    },
    type: {
      type: String,
      required: true,
    },
    relationship: {
      type: String,
      required: true,
      enum: [
        "self",
        "son",
        "daughter",
        "mother",
        "father",
        "uncle",
        "aunt",
        "other",
      ],
    },
    phone_number: {
      type: String,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    photo: String,
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("passengers", passengerSchema);
