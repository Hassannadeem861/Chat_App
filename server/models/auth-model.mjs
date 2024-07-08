import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false},

    avatar: {
      url: String,
      public_id: String,
    },
    role: { type: String, default: "user" },
    createdOn: { type: Date, default: Date.now },

    //   answer: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("Auth", userSchema);
export default User;
