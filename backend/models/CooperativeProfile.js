const mongoose = require("mongoose");


const cooperativeProfileSchema = new mongoose.Schema(
{

  cooperativeId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Cooperative",
    required:true,
    unique:true
  },


  description:{
    type:String,
    default:""
  },


  logo:{
    type:String,
    default:""
  },


  favicon:{
    type:String,
    default:""
  },


  banner:{
    type:String,
    default:""
  },


  appName:{
    type:String,
    default:"Aama Cooperatives"
  },


  customDomain:{
    type:String,
    default:""
  },


  colors:{

    primary:{
      type:String,
      default:"#0f172a"
    },


    secondary:{
      type:String,
      default:"#3b82f6"
    },


    accent:{
      type:String,
      default:"#10b981"
    }

  },


  services:[
    {
      name:String,
      description:String
    }
  ],


  savingsProducts:[
    {
      name:String,
      description:String,
      interestRate:Number
    }
  ],


  loanProducts:[
    {
      name:String,
      description:String,
      interestRate:Number,
      minAmount:Number,
      maxAmount:Number,
      minTenure:Number,
      maxTenure:Number,
      collateral:String,
      eligibility:String,
      processingTime:String
    }
  ],

  // Quick stats shown on the public profile
  stats:{
    memberCount:{ type:Number, default:0 },
    totalDeposits:{ type:Number, default:0 },
    totalWithdrawals:{ type:Number, default:0 },
    totalLoanCollections:{ type:Number, default:0 },
    totalLoansDisbursed:{ type:Number, default:0 },
    totalSavingsProducts:{ type:Number, default:0 }
  },


  announcements:[
    {
      title:String,
      content:String,
      date:{
        type:Date,
        default:Date.now
      }
    }
  ],


  verifiedDocs:[
    {
      name:String,
      url:String
    }
  ]

},
{
 timestamps:true
});


module.exports = mongoose.model(
 "CooperativeProfile",
 cooperativeProfileSchema
);