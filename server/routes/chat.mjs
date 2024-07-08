import express from "express";
import {
  createGroup,
  getAllChats,
  getMyGroups,
  addMembers,
  removeMembers,
  leaveGroup,
  attachment,
  getMessageDetails,
  renameGroupName,
  deleteChat,
  getPaginationMessages,
} from "../controllers/chat.controller.mjs";
import { authMiddleware, adminMiddleWare } from "../middle-ware/auth.mjs";
import {
  createGroupSchema,
  addMembersSchema,
  removeMembersSchema,
  leaveGroupSchema,
  sendAttachmentsSchema,
  getPaginationSchema,
  getMessageDetalsSchema,
  renameGroupNameSchema,
  deleteChatSchema,
} from "../validations/auth.validation.mjs";
import validate from "../middle-ware/validation.middleware.mjs";
const router = express.Router();
import multer from "multer";
import fs from "fs";

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads/";
    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log("Multer file: ", file);
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadMiddleware = multer({ storage: storageConfig });

router.post(
  "/new-chat",
  authMiddleware,
  validate(createGroupSchema),
  createGroup
);
router.get("/my", authMiddleware, getAllChats);
router.get("/my/groups", authMiddleware, getMyGroups);
router.put(
  "/add-members",
  authMiddleware,
  validate(addMembersSchema),
  addMembers
);
router.delete(
  "/remove-member",
  authMiddleware,
  validate(removeMembersSchema),
  removeMembers
);
router.delete(
  "/leave-group/:id",
  authMiddleware,
  validate(leaveGroupSchema),
  leaveGroup
);

// Send Attachment
router.post(
  "/message",
  authMiddleware,
  uploadMiddleware.array("files", 5),
  validate(sendAttachmentsSchema),
  attachment
);

// Single get messages and pagination
router.get(
  "/message/:id",
  authMiddleware,
  validate(getPaginationSchema),
  getPaginationMessages
);

// Single get chat details , rename,delete
router.get(
  "/chat/:id",
  authMiddleware,
  validate(getMessageDetalsSchema),
  getMessageDetails
);
router.put(
  "/chat/:id",
  authMiddleware,
  validate(renameGroupNameSchema),
  renameGroupName
);
router.delete(
  "/chat/:id",
  authMiddleware,
  validate(deleteChatSchema),
  deleteChat
);

// router.delete("/chat/:id", renameGroupName, authMiddleware)

export default router;
