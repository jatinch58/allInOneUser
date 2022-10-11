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
