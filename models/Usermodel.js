const mongoos = require("mongoose");
const db = require("../config/DBconfig");
const bcrypt = require("bcrypt");

const { Schema } = mongoos;
const locationSchema = new Schema({
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
});
const addressSchema = new Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  location: {
    type: locationSchema,
    required: false,
  },
  address: {
    type: addressSchema,
    required: false,
  },
  profilepicture: {
    type: String,
    required: false,
  },
});

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      console.log("Password not modified, skipping hash");
      return next();
    }

    console.log("Pre-save: Original password:", this.password);
    const salt = await bcrypt.genSalt(10);
    console.log("Pre-save: Generated salt:", salt);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    console.log("Pre-save: Generated hash:", hashedPassword);
    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error("Pre-save error:", error);
    next(error);
  }
});

// Enhanced comparePassword method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("comparePassword method called");
    console.log("Candidate password:", candidatePassword);
    console.log("Stored hash:", this.password);

    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log("Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("comparePassword error:", error);
    throw error;
  }
};

const UserModel = db.model("user", userSchema);
module.exports = UserModel;
