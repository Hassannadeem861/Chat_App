import mongoose, { Types } from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },
    sender: { type: Types.ObjectId, ref: "Auth", required: true },
    receiver: [{ type: Types.ObjectId, ref: "Auth", required: true }],
    createdOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;
