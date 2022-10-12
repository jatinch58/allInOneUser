const Category = require("../models/category");
exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find({}).populate([
      "subCategory",
      "service",
    ]);
    if (categories) {
      return res.status(200).json({ result: categories });
    }
    return res.status(500).json({ message: "Something went wrong" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: e.name });
  }
};
