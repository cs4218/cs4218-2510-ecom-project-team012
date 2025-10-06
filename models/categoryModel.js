import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // uncommented these
    unique: true, // uncommented these
  },
  slug: {
    type: String,
    lowercase: true,
    required: true,
    unique: true, // enforce uniqueness for singleCategoryController
  },
});

export default mongoose.model("Category", categorySchema);