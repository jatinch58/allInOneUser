const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
const { verifyToken } = require("../middlewares/auth");
router.post("/sendOTP", user.phoneLogin);
router.post("/verifyOTP", user.verifyOTP);
router.put("/profile", verifyToken, user.updateProfile);
router.put("/phone", verifyToken, user.changePhone);
module.exports = router;
