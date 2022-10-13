const express = require("express");
const router = express.Router();
const category = require("../controllers/category");
const { verifyToken } = require("../middlewares/auth");
router.get("/allCategory", category.getAllCategory);
module.exports = router;
