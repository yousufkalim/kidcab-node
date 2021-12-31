/**
 * Passenger schema
 * @author Arooj Ishfaq
 */
const { Schema, model } = require("mongoose");

// Schema
const passengerSchema = new Schema(
  {
    _id: String,
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    relationship: {
      type: String,
      required: true,
      enum: [
        "self",
        "son",
        "brother",
        "sister",
        "daughter",
        "mother",
        "father",
        "uncle",
        "aunt",
        "other",
      ],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("passengers", passengerSchema);
