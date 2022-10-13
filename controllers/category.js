const Category = require("../models/category");
exports.getAllCategory = async (req, res) => {
  try {
    let category = await Category.find(
      {},
      { _id: 1, name: 1, subCategory: 1, createdAt: 1, updatedAt: 1 }
    )
      .populate({
        path: "subCategory",
        select: { _id: 1, name: 1, createdAt: 1, updatedAt: 1 },
        populate: {
          path: "subCategory2",
          select: { _id: 1, name: 1, service: 1, createdAt: 1, updatedAt: 1 },
          populate: {
            path: "service",
            model: "service",
            select: {
              _id: 1,
              name: 1,
              description: 1,
              rating: 1,
              image: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        },
      })
      .populate({
        path: "subCategory",
        model: "subCategory",
        select: { _id: 1, name: 1, createdAt: 1, updatedAt: 1 },
        populate: {
          path: "service",
          model: "service",
          select: {
            _id: 1,
            name: 1,
            description: 1,
            rating: 1,
            image: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      })
      .populate("service", {
        name: 1,
        description: 1,
        rating: 1,
        image: 1,
        createdAt: 1,
        updatedAt: 1,
      });

    if (!category) {
      return res
        .status(500)
        .send({ success: false, message: "Something went wrong" });
    }
    return res.status(200).send({
      success: true,
      message: "All Category SubCategory SubCategory2 fetched successfully",
      category,
    });
  } catch (e) {
    return res.status(500).send({ success: false, error: e.name });
  }
};
