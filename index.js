require("dotenv/config");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const allRoutes = require("./routes/index");
const cors = require("cors");
app.use(express.json());
app.use(allRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to database"))
  .catch((e) => {
    console.log("Couldn't connected to database", e);
  });
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
