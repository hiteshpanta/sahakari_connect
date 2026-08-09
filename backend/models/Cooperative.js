const mongoose = require("mongoose");


const cooperativeSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },


  address: {
    type: String,
    required: true
  },

  district: {
    type: String,
    default: ""
  },

  province: {
    type: String,
    default: ""
  },

  establishedYear: {
    type: Number
  },

  category: {
    type: String,
    enum: [
      "Saving & Credit",
      "Multi-purpose",
      "Agriculture",
      "Dairy",
      "Thrift",
      "Housing",
      "Consumer"
    ],
    default: "Saving & Credit"
  },


  contactEmail: {
    type: String,
    required: true
  },


  contactPhone: {
    type: String,
    required: true
  },


  registrationNo: {
    type: String,
    unique: true,
    sparse: true
  },

  // Manager who created the cooperative
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },


  // Multiple managers can manage one cooperative
  managers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],


  // Approved members
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],


  status: {
    type: String,
    enum: [
      "active",
      "inactive",
      "pending",
      "suspended",
      "rejected"
    ],
    default: "pending"
  },


  subscriptionPlan: {
    type: String,
    enum: [
      "free",
      "basic",
      "premium"
    ],
    default: "free"
  },


  subscriptionExpiry: {
    type: Date
  }

},
{
  timestamps:true
});


module.exports = mongoose.model(
  "Cooperative",
  cooperativeSchema
);