const validator = require("../validators/validators");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Mail = require("../models/mail");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
  Bucket: process.env.BUCKET_NAME,
});
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
          if (isAlreadyRegistered && isAlreadyRegistered.firstName) {
            const _id = isAlreadyRegistered._id.toString();
            const refreshToken = uuidv4();
            const makeRefreshToken = await RefreshToken.findOneAndUpdate(
              {
                user_id: _id,
              },
              {
                refreshToken: refreshToken,
              },
              { upsert: true, new: true }
            );
            if (!makeRefreshToken) {
              return res.status(500).json({ message: "Something went wrong" });
            }
            const token = jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
              expiresIn: "24h",
            });
            return res.status(200).json({
              message: "Welcome back",
              token: token,
              refreshToken: refreshToken,
              user_id: _id,
            });
          }
          if (isAlreadyRegistered) {
            const _id = isAlreadyRegistered._id.toString();
            const refreshToken = uuidv4();
            const makeRefreshToken = await RefreshToken.findOneAndUpdate(
              {
                user_id: _id,
              },
              {
                refreshToken: refreshToken,
              },
              { upsert: true, new: true }
            );
            if (!makeRefreshToken) {
              return res.status(500).json({ message: "Something went wrong" });
            }
            const token = jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
              expiresIn: "24h",
            });
            return res.status(200).json({
              message: "Registered successful",
              token: token,
              refreshToken: refreshToken,
              user_id: _id,
            });
          }
          const createUser = new User({
            phone: req.body.phone,
          });
          const createdUser = await createUser.save();
          if (createdUser) {
            const _id = createdUser._id.toString();
            const refreshToken = uuidv4();
            const makeRefreshToken = await RefreshToken.findOneAndUpdate(
              {
                user_id: _id,
              },
              {
                refreshToken: refreshToken,
              },
              { upsert: true, new: true }
            );
            if (!makeRefreshToken) {
              return res.status(500).json({ message: "Something went wrong" });
            }
            const token = jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
              expiresIn: "24h",
            });
            return res.status(201).json({
              message: "Registered successful",
              token: token,
              refreshToken: refreshToken,
              user_id: _id,
            });
          }
          return res.status(500).json({ message: "Something bad happened" });
        } else if (response.data.Details === "OTP Expired") {
          return res.status(403).json({ message: "OTP Expired" });
        }
        return res.status(500).json({ message: "Something went wrong 1" });
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
//==================================== upload profile picture =============================================//
exports.uploadProfilePicture = async (req, res) => {
  try {
    const { error } = validator.uploadPictureSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, data) => {
      if (error) {
        return res.status(500).send(error);
      }
      const result = await parentdb.findByIdAndUpdate(req.user._id, {
        imageUrl: data.Location,
      });
      if (result) {
        return res
          .status(200)
          .json({ message: "uploaded Profile Picture successfully" });
      }
      return res.status(500).json({ message: "Something bad happened" });
    });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
//===================================== update profile picture =========================================//
exports.updateProfilePicture = async (req, res) => {
  try {
    const { error } = validator.updatePictureSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let myFile = req.file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuidv4()}.${fileType}`,
      Body: req.file.buffer,
    };
    s3.upload(params, async (error, dataResult) => {
      if (error) {
        return res.status(500).send(error);
      }
      let p = req.body.imageUrl;
      if (p) {
        p = p.split("/");
        p = p[p.length - 1];
        const params1 = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: p,
        };
        const s3delete = function (params) {
          return new Promise((resolve, reject) => {
            s3.createBucket(
              {
                Bucket: params.Bucket,
              },
              function () {
                s3.deleteObject(params, async function (err, data) {
                  if (err) return res.status(500).send({ message: err });
                  const result = await parentdb.findByIdAndUpdate(
                    req.user._id,
                    {
                      imageUrl: dataResult.Location,
                    }
                  );
                  if (result) {
                    return res
                      .status(200)
                      .send({ message: "Image updated successfully" });
                  }
                  return res
                    .status(500)
                    .send({ message: "Something bad happened" });
                });
              }
            );
          });
        };
        s3delete(params1);
      } else {
        const result = await parentdb.findByIdAndUpdate(req.user._id, {
          imageUrl: data.Location,
        });
        if (result) {
          return res.status(200).send("updated sucessfully");
        }
        return res.status(500).send({ message: "Something went wrong" });
      }
    });
  } catch (e) {
    return res.status(500).send({ message: e.name });
  }
};
//=================================== refresh token ================================================//
exports.refreshToken = async (req, res) => {
  try {
    const { error } = validator.refreshTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newRefreshToken = uuidv4();
    const refresh = await RefreshToken.findOneAndUpdate(
      { user_id: req.body.user_id, refreshToken: req.body.refreshToken },
      {
        refreshToken: newRefreshToken,
      },
      { new: true }
    );
    if (!refresh) {
      return res.status(400).json({ message: "Wrong refresh token" });
    }
    const token = jwt.sign({ _id: req.body.user_id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return res
      .status(200)
      .json({ refreshToken: newRefreshToken, token: token });
  } catch (e) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
