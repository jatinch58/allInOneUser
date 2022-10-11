const { Schema, model } = require("mongoose");
const userSchema = new Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  dateOfBirth: {
    type: String,
  },
  gender: {
    type: String,
  },
  city: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
});
module.exports = model("user", userSchema);
