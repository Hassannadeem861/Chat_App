import mongoose, { Types } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: { type: String },
    attachments: [
      {
        url: String,
        public_id: String,
      },
    ],
    sender: { type: Types.ObjectId, ref: "Auth", required: true },
    chat: [{ type: Types.ObjectId, ref: "Chat", required: true }],
    createdOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
