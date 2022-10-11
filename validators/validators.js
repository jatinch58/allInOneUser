const Joi = require("joi");
exports.phoneSchema = Joi.object()
  .keys({
    phone: Joi.string()
      .regex(/^[6-9]{1}[0-9]{9}$/)
      .required(),
  })
  .required();

exports.otpSchema = Joi.object()
  .keys({
    details: Joi.string().required(),
    otp: Joi.number().max(999999).required(),
    phone: Joi.string()
      .regex(/^[6-9]{1}[0-9]{9}$/)
      .required(),
  })
  .required();
exports.profileSchema = Joi.object()
  .keys({
    firstName: Joi.string().min(3).required(),
    lastName: Joi.string().min(3).required(),
    dob: Joi.date().less("now").required(),
    gender: Joi.string().valid("male", "female").required(),
    city: Joi.string().required(),
    pincode: Joi.number().min(100000).max(999999).required(),
  })
  .required();
