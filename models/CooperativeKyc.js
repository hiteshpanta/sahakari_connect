const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
{
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  cooperative:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Cooperative",
    required:true
  },

  // Applicant details (denormalized so the application is a complete record
  // even if the user edits their profile later)
  applicant:{
    name:String,
    phone:String,
    email:String,
    address:String,
    gender:{ type:String, enum:["Male","Female","Other"] },
    dob:Date,
    citizenshipNo:String,
    branch:String,
    nomineeName:String,
    nomineeRelation:String,
    nomineePhone:String
  },

  kycDocuments:{
    citizenshipFront:String,
    citizenshipBack:String,
    photo:String,
    signature:String,
    addressProof:String
  },

  status:{
    type:String,
    enum:[
      "pending",
      "approved",
      "rejected",
      "insufficient"
    ],
    default:"pending"
  },

  remarks:{
    type:String,
    default:""
  },

  reviewedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }

},
{
 timestamps:true
});

// A user can only have one active application per cooperative
membershipSchema.index({ user: 1, cooperative: 1 }, { unique: true });

module.exports = mongoose.model(
"MembershipApplication",
membershipSchema
);
