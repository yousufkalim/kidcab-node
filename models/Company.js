/**
 * Admin schema
 * @author Arooj Ishfaq
 */
const mongoose = require('mongoose');

// Schema
const companySchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: ''
    },

    phone_number: {
      type: String
    },

    company_name: String,
    address: String,
    siret_number: String,
    vat_number: String,
    legal_form: String,
    share_capital: String,
    rcs_city: String,
    bank_name: String,
    iban: String
  },
  {
    timestamps: true
  }
);

// Model
module.exports = mongoose.model('company', companySchema);
