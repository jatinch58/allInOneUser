const { Schema, model } = require("mongoose");
const subCategory2 = require("./subCategory2");
const service = require("./service");
const SubCategorySchema = new Schema(
  {
    name: {
      type: String,
    },
    image: {
      type: Buffer,
    },
    subCategory2: [
      {
        type: Schema.Types.ObjectId,
        ref: subCategory2,
      },
    ],
    service: [
      {
        type: Schema.Types.ObjectId,
        ref: service,
      },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = model("subCategory", SubCategorySchema);
