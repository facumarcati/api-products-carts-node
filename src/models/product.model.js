import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  code: String,
  price: Number,
  status: Boolean,
  stock: Number,
  category: String,
  thumbnails: [String],
});

productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model("products", productSchema);

export default ProductModel;
