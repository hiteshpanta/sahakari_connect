const mongoose = require("mongoose");


const branchSchema = new mongoose.Schema(
{

name:{
  type:String,
  required:true,
  unique:true
},


location:{
  type:String,
  required:true
},


manager:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
},


phone:{
  type:String
},


established:{
  type:Date
},


status:{
  type:String,
  enum:[
    "active",
    "inactive"
  ],
  default:"active"
},


customers:{
  type:Number,
  default:0
},


accounts:{
  type:Number,
  default:0
},


loans:{
  type:Number,
  default:0
},


cooperativeId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Cooperative",
  required:true
}


},
{
 timestamps:true
});


module.exports = mongoose.model(
"Branch",
branchSchema
);