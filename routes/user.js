const express = require("express");
const router = express.Router();
const user = require("../controllers/user");
router.post("/sendOTP", user.phoneLogin);
router.post("/verifyOTP", user.verifyOTP);
module.exports = router;
