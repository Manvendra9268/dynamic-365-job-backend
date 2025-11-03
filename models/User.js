// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { required } = require('zod/mini');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true, // required for all roles now
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
      phoneNumber:{
      type: String,
      required: true
    },
    // Employer-specific

    organizationName: {
      type: String,
    },
    organizationSize:{
      type: Number,
    },
    founded:{
      type: Number,
    },
    headquarters:{
      type: String,
    },
    organizationLinkedIn:{
      type: String,
    },
    organizationWebsite:{
      type: String,
    },
    // jobseeker–specific
    areasOfInterest: {
      type: [String],
      default: [],
    },
    currentRole: {
      type: String,
    },
    country: {
      type: String,
    },
    contactSharing: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
