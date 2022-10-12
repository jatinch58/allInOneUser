const validator = require("../validators/validators");
const User = require("../models/user");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Mail = require("../models/mail");
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
//============================================= get my profile =======================================================//
exports.getMyProfile = async (req, res) => {
  try {
    const myProfile = await User.findById(req.user._id);
    if (myProfile) {
      return res.status(200).json({ result: myProfile });
    }
    return res.status(500).json({ message: "Something went wrong" });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//========================================= send otp to mail =======================================================//
exports.sendMailOTP = async (req, res) => {
  try {
    const { error } = validator.emailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const createOTP = new Mail({
      OTP: Number(otp),
      email: req.body.email,
    });
    createOTP
      .save()
      .then(async (val) => {
        let transporter = nodemailer.createTransport({
          service: process.env.SERVICE,
          host: process.env.HOST,
          port: process.env.PORTMAIL,
          secure: false,
          auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD,
          },
        });
        let info = await transporter.sendMail({
          from: process.env.USER,
          to: req.body.email,
          subject: "OTP",
          html: `Hi your OTP is ${otp}`,
        });

        if (info.accepted.length !== 0) {
          return res
            .status(200)
            .json({ message: "OTP sent successfully", id: val._id });
        }
        return res.status(500).json({ message: "Something went wrong" });
      })
      .catch((e) => {
        res.status(500).send({ message: e.name });
      });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//======================================= verify email otp =================================================//
exports.verifyMailOTP = async (req, res) => {
  try {
    const { error } = validator.verifyEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const verifyOTP = await Mail.findById(req.body.id);
    if (!verifyOTP) {
      return res.status(403).json({ message: "OTP expired" });
    }
    if (verifyOTP.OTP !== req.body.otp) {
      return res.status(400).json({ message: "Wrong OTP" });
    }
    if (verifyOTP.OTP === req.body.otp) {
      const updateEmail = await User.findByIdAndUpdate(req.user._id, {
        email: verifyOTP.email,
      });
      if (updateEmail) {
        return res.status(200).json({ message: "Email successfully updated" });
      }
      return res.status(500).json({ message: "Something went wrong" });
    }
    return res.status(500).json({ message: "Something went wrong" });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
