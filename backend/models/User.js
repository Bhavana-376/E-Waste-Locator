const mongoose = require("mongoose");

const creditEntrySchema = new mongoose.Schema({
  items: [String],           
  quantity: Number,          
  recoveryType: String,      
  centerName: String,        
  recoveredDate: Date,       
  notes: String,             
  pointsEarned: Number       
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  phone: String,
  address: String,
  credits: {type : Number, default:0},
  creditHistory: [creditEntrySchema]
});

module.exports = mongoose.model("User", userSchema);
