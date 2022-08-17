/**
 * Ride Request schema
 * @author Shuja Naqvi
 */
const { Schema, model } = require('mongoose');

// Schema
const riderequestSchema = new Schema(
  {
    you_are: {
      tpye: String,
    },
    journey_type: [
      {
        type: String,
        enum: ['One Way ticket', 'Round trip', 'Journey with stage(s)'],
      },
    ],
    days: [
      {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      },
    ],
    journey_frequency: {
      type: String,
      enum: ['Occasional', 'Regular'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'decline'],
      default: 'pending',
    },
    passengers: Number,
    price: Number,
    email: String,
    phone: String,
    message: String,
    company_name: String,
    first_name: String,
    last_name: String,
    door_support: Boolean,
    total_children: Number,
    total_adults: Number,
    baby: Number,
    pickUp_date: Date,
    pickUp_time: String,
    return_time: String,
    return_date: Date,
    return_address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    distance: Number,
    pickUp_address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    destination_address: {
      lat: String,
      lng: String,
      label: String,
      label2: String,
      city: String,
      postal_code: String,
    },
    // client: {
    //   type: Schema.Types.ObjectId,
    //   ref: "users",
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

// Model
module.exports = model('ridesrequest', riderequestSchema);
