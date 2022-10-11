const validator = require("../validators/validators");
const User = require("../models/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
//================================================= phone login ==============================================//
exports.phoneLogin = (req, res) => {
  try {
    const { error } = validator.phoneSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    axios
      .get(process.env.OTP_API + req.body.phone + "/AUTOGEN")
      .then((response) => {
        return res.status(200).json({
          message: "OTP sent successfully",
          details: response.data.Details,
        });
      })
      .catch((er) => {
        return res.status(500).json({ message: "Error", error: er.name });
      });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//=================================================== verify otp ===============================================//
exports.verifyOTP = (req, res) => {
  try {
    const { error } = validator.otpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    axios
      .get(
        process.env.OTP_API + "VERIFY/" + req.body.details + "/" + req.body.otp
      )
      .then(async (response) => {
        if (response.data.Details === "OTP Matched") {
          const isAlreadyRegistered = await User.findOne({
            phone: req.body.phone,
          });
          if (isAlreadyRegistered.firstName) {
            const _id = isAlreadyRegistered._id.toString();
            const token = jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
              expiresIn: "24h",
            });
            return res.status(200).json({
              message: "Welcome back",
              token: token,
            });
          }
          if (isAlreadyRegistered) {
            const _id = isAlreadyRegistered._id.toString();
            const token = jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
              expiresIn: "24h",
            });
            return res.status(200).json({
              message: "Registered successful",
              token: token,
            });
          }
          const createUser = new User({
            phone: req.body.phone,
          });
          createUser
            .save()
            .then(async (result) => {
              const _id = result._id.toString();
              const token = jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
                expiresIn: "24h",
              });
              return res.status(201).json({
                message: "Registered successful",
                token: token,
              });
            })
            .catch(() => {
              return res
                .status(500)
                .json({ message: "Something bad happened" });
            });
        } else if (response.data.Details === "OTP Expired") {
          return res.status(403).json({ message: "OTP Expired" });
        }
        return res.status(500).json({ message: "Something went wrong" });
      })
      .catch((error) => {
        return res.status(500).json(error);
      });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//================================================ update profile ===============================================//
exports.updateProfile = async (req, res) => {
  try {
    const { error } = validator.profileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const update = await User.findByIdAndUpdate(req.user._id, req.body);
    if (update) {
      return res.status(200).json({ message: "Updated profile successfully" });
    }
    return res.status(500).json({ message: "Something went wrong" });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//=================================================== update mobile number ========================================//
exports.changePhone = (req, res) => {
  try {
    const { error } = validator.otpSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    axios
      .get(
        process.env.OTP_API + "VERIFY/" + req.body.details + "/" + req.body.otp
      )
      .then(async (response) => {
        if (response.data.Details === "OTP Matched") {
          const updatePhone = await User.findByIdAndUpdate(req.user._id, {
            phone: req.body.phone,
          });

          if (updatePhone) {
            return res.status(200).json({ message: "Updated successfully" });
          }
          return res.status(500).json({ message: "Something went wrong" });
        } else if (response.data.Details === "OTP Expired") {
          return res.status(403).json({ message: "OTP Expired" });
        }
        return res.status(500).json({ message: "Something went wrong" });
      })
      .catch((error) => {
        return res.status(500).json(error);
      });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
