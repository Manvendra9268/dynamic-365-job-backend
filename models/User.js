// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { required } = require('zod/mini');
const MongooseDelete = require('mongoose-delete');

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
    profileImage:{
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [0, 1, 2], // 0: Inactive, 1: Active, 2: Suspended
      default: 1
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
    industry:{
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
    otherRole: {
      type: String,
      default: null
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
  // Skip hashing if password not modified OR missing
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});


// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//delete-user-plugin
userSchema.plugin(MongooseDelete, {
  deletedAt: true,
  deletedBy: true,
  overrideMethods: 'all',
});

module.exports = mongoose.model("User", userSchema);
