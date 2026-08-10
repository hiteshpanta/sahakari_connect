const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true, 
    match: [
      /^\S+@\S+\.\S+$/,
      "Please provide a valid email"
    ],
  },
  password: { 
    type: String, 
    required: true,
    // Add custom validator for strong password
    validate: {
      validator: function(v) {
        // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
        // Note: we only run this validator if the password is being modified and is not yet hashed
        if (!this.isModified('password')) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
    }
  },
  role: { type: String, enum: ['admin', 'manager', 'staff', 'member'], default: 'staff' },
  branch: { type: String, required: false }, // Branch not required for admin
  cooperativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' }, // Active cooperative portal
  cooperatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cooperative' }], // All approved memberships
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }, // Links member users to their Customer record
  avatar: { type: String },
  phone: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  joinDate: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function() {

  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// userSchema.index({ email: 1 }); // Index for email to speed up queries
module.exports = mongoose.model('User', userSchema);
