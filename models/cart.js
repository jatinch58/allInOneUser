const User = require("./user");
const { Service } = require("./service");
const { Schema, model } = require("mongoose");
const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  item: [
    {
      type: Schema.Types.ObjectId,
      ref: Service,
    },
  ],
});
module.exports = model("cart", cartSchema);
