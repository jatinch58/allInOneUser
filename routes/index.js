const express = require("express");
const router = express.Router();
const userRoutes = require("./user");
const categoryRoutes = require("./category");
router.use("/user", userRoutes);
router.use("/category", categoryRoutes);
module.exports = router;
