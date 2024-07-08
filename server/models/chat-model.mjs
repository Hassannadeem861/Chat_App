import mongoose, { Types } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    groupChat: { type: Boolean, default: false },
    creator: { type: Types.ObjectId, ref: "Auth" },
    members: [{ type: Types.ObjectId, ref: "Auth" }],
    createdOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
