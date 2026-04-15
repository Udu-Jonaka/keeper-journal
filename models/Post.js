import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    authorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true,
    },
    comments: [CommentSchema],
  },
  { timestamps: true },
);

export default mongoose.models.Post || mongoose.model("Post", PostSchema);
