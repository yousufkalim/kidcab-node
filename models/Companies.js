/**
 * Companies schema
 * @author Usman Haider
 */
const { Schema, model } = require("mongoose");

// Schema
const companySchema = new Schema(
  {
    company_name: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },
    siret_number: {
      type: String,
      required: true,
    },
    legal_info: {
      type: String,
      required: true,
    },
    social_capital: {
      type: String,
      required: true,
    },
    vat_number: {
      type: String,
    },
    city_of_rcs: {
      type: String,
    },
    manager_id: {
      type: Schema.Types.ObjectId,
      ref: "drivers",
    },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model("Companies", companySchema);
