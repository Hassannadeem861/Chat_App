// Is function ka basic aim ye hai ke ek new group chat create kiya jaye jisme kam se kam 3 members hon
// (including current user), aur agar koi error hoti hai to usko handle kiya jaye.

import Chat from "../models/chat-model.mjs";
import Auth from "../models/auth-model.mjs";
import Message from "../models/message-model.mjs";
import dotenv from "dotenv";
import {
  ALERT,
  REFETCH_CHATS,
  NEW_MESSAGE_ALERT,
  NEW_ATTACHMENTS,
} from "../constants/events.mjs";
import { emitEvent, deleteFromCloudinary } from "../config/feauters.mjs";
import getOtherMembers from "../lib/helper.mjs";
import uploadImage from "../config/cloudinaryConfig.mjs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { promises } from "dns";

// Load environment variables
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
// console.log("__filename :", __filename);
var __dirname = dirname(__filename);
// console.log("__dirname :", __dirname);

const createGroup = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    console.log("name, members :", req.body);

    // if (members?.length < 2) {
    //   return res
    //     .status(400)
    //     .json({ message: "Group chat must have at least 3 members" });
    // }

    // members array ko copy karke usme current logged-in user ko add kiya ja raha hai.
    const allMembers = [...members, req.user];
    console.log("allMembers :", allMembers);

    const createGroupChat = await Chat.create({
      name,
      members: allMembers,
      groupChat: true,
      creator: req.user,
    });
    console.log("createGroupChat :", createGroupChat);

    // Pehla event sab members ko welcome message bhej raha hai aur doosra event chats ko refresh kar raha hai
    emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);

    res
      .status(200)
      .json({ message: "Group created successfull", createGroupChat });
  } catch (error) {
    next(error);
    console.log("error ", error);
  }
};

const getAllChats = async (req, res, next) => {
  try {
    // Hum Chat database se wo chats dhoond rahay hain jahan members field mai current user (req.user) ho.
    // populate ka matlab hai hum members ki name aur avatar fields bhi le rahay hain.
    const chats = await Chat.find({ members: req.user }).populate(
      "members",
      "name avatar" // Note: fields should be space-separated, not comma-separated
    );
    console.log("chats: ", chats);

    // Har Chat Ko Transform Karna:
    // groupChat agar true hai:
    // avatar field mai 3 members ke avatars dalenge.
    // groupChat agar false hai:
    // Sirf dusray member ka avatar dalenge.
    // name field mai:
    // groupChat agar true hai to group ka naam dalenge.
    // Warna dusray member ka naam dalenge.
    // members field mai:
    // Saare members dalenge jo current user nahi hain.

    const transformedData = await Promise.all(
      chats.map(async ({ _id, name, groupChat, members }) => {
        //Yeh function wo member dhoondta hai jo current user (req.user) nahi hai.
        // Matlab, group chat mai dusray members ko find karta hai jo user nahi hain.
        // Example
        // Agar aapke paas 2 users hain: Ali aur Hassan.
        // Ali ko un saari chats mai dhoondho jahan Ali ho.
        // Har chat ko check karo:
        // Agar yeh group chat hai to 3 members ke avatars dalo.
        // Agar yeh group chat nahi hai to sirf Hassan ka avatar dalo.
        // Agar yeh group chat hai to group ka naam dalo.
        // Agar yeh group chat nahi hai to Hassan ka naam dalo.
        // Members field mai Ali ko hata kar baaki sab ke IDs dalo.

        const otherMembers = getOtherMembers(members, req.user);

        return {
          _id,
          groupChat,
          avatar: groupChat
            ? members.slice(0, 3).map(({ avatar }) => avatar.url)
            : [otherMembers.avatar.url],
          name: groupChat ? name : otherMembers.name,
          members: members.reduce((prev, curr) => {
            if (curr._id?.toString() !== req?.user?.toString()) {
              prev.push(curr._id);
            }
            return prev;
          }, []),
        };
      })
    );

    console.log("transformedData: ", transformedData);

    res
      .status(200)
      .json({ message: "Get all chats successful", chats: transformedData });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

const getMyGroups = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      members: req.user,
      groupChat: true,
      creator: req.user,
    }).populate("members", "name avatar");
    console.log("chats :", chats);

    const transformedGroups = chats.map(({ _id, name, groupChat, members }) => {
      return {
        _id,
        name,
        groupChat,
        avatar: members.slice(0, 3).map(({ avatar }) => avatar.url),
      };
    });
    console.log("transformedGroups :", transformedGroups);
    res
      .status(200)
      .json({ message: "Get all groups successfull", transformedGroups });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

const addMembers = async (req, res, next) => {
  try {
    //Pehle hum request body se chatId aur members ko nikalte hain aur console mai print karte hain:
    const { chatId, members } = req.body;
    console.log("chatId, members: ", req.body);

    //Check karte hain ke members provide kiye gaye hain ya nahi aur unki length kam az kam 1 ho:
    // if (!members || members.length < 1) {
    //   return res.status(400).json({ message: "Please provide members" });
    // }

    // Is step mai aap chatId se chat ko database se fetch karte hain
    // aur check karte hain ke chat exist karti hai ya nahi.
    // Phir check karte hain ke ye group chat hai ya nahi aur user ko permission hai ke nahi.
    const chat = await Chat.findById(chatId);

    console.log("chat ", chat);

    if (!chat) {
      return res.status(403).json({ message: "Chat not found" });
    }

    if (!chat.groupChat) {
      return res.status(400).json({ message: "This is not a group chat" });
    }

    // is line mai ya baat ho rhi hain ka jo creator hain or jo user jo request kar rha hain hain dono alag alag hain
    // to hum ya error throw karenga ka creator hi members ko add kar sakta hain
    if (chat.creator.toString() !== req.user.toString()) {
      return res
        .status(400)
        .json({ message: "This is not allowed to add members" });
    }

    // Yahaan aap members ko fetch karne ke liye Auth.findById use kar rahe hain.
    const allNewMembersPromise = members?.map((i) => Auth.findById(i, "name"));
    // console.log("allNewMembersPromise ", allNewMembersPromise);

    // Har member ko Promise.all ke zariye fetch karte hain.
    const allNewMembers = await Promise.all(allNewMembersPromise);
    console.log("allNewMembers ", allNewMembers);

    // Yahaan aap unique members ko filter kar rahe hain jo pehle se chat members mai nahi hain.
    //Check karte hain ke kaunse members already chat mai nahi hain:
    const uniqueMembers = allNewMembers.filter(
      (i) =>
        !chat.members.some((member) => member.toString() === i._id.toString())
    );
    console.log("uniqueMembers; ", uniqueMembers);

    //Unique members ki Id ko chat ke members array mai add karte hain:
    chat.members.push(...uniqueMembers.map((i) => i._id));

    if (chat.members.length > 100) {
      return res.status(400).json({ message: "Group members limit reached" });
    }

    await chat.save();

    // Naye members ke names ko join karte hain, notification emit karte hain aur response return karte hain:
    const allUsersName = allNewMembers.map((i) => i.name).join(",");
    console.log("allUsersName ", allUsersName);

    emitEvent(
      req,
      ALERT,
      chat.members,
      `${allUsersName} has been added in the group`
    );

    emitEvent(req, REFETCH_CHATS, chat.members);
    res.status(200).json({ message: "Members edit successfully" });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

// is api ka kya kam hain mujha samjhna hai chatgpt sai
const removeMembers = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    console.log("chatId, userId :", req.body);

    const [chat, userThatWillBeRemoved] = await Promise.all([
      Chat?.findById(chatId),
      Auth?.findById(userId, "name"),
    ]);

    console.log("chat :", chat);
    console.log("userThatWillBeRemoved :", userThatWillBeRemoved);

    // aur check karte hain ke chat exist karti hai ya nahi.
    // Phir check karte hain ke ye group chat hai ya nahi aur user ko permission hai ke nahi.
    if (!chat) {
      return res.status(403).json({ message: "Chat not found" });
    }

    if (!chat.groupChat) {
      return res.status(400).json({ message: "This is not a group chat" });
    }

    if (chat.creator.toString() !== req.user.toString()) {
      return res
        .status(400)
        .json({ message: "This is not allowed to add members" });
    }

    if (chat?.members?.length <= 3) {
      return res
        .status(400)
        .json({ message: "Group must have at least 3 members" });
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    await chat.save();

    emitEvent(
      req,
      ALERT,
      chat.members,
      `${userThatWillBeRemoved.name} has been removed from the group`
    );
    emitEvent(req, REFETCH_CHATS, chat.member);

    res.status(200).json({ message: "Members removed successfully" });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

// is Api ko test karna hain postman main
const leaveGroup = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    console.log("chatId: ", chatId);

    // Is step mai aap chatId se chat ko database se fetch karte hain
    // aur check karte hain ke chat exist karti hai ya nahi.
    // Phir check karte hain ke ye group chat hai ya nahi aur user ko permission hai ke nahi.
    const chat = await Chat.findById(chatId);
    console.log("chat: ", chat);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.groupChat) {
      return res.status(400).json({ message: "This is not a group chat" });
    }

    const remainingMember = await chat.members.filter(
      (member) => member.toString() !== req.user.toString()
    );
    console.log("remainingMember: ", remainingMember);

    if (remainingMember.length < 3) {
      res.status(400).json({ message: "Group must have at least 3 memebrs" });
    }

    if (chat.creator.toString() === req.user.toString()) {
      const randomElement = Math.floor(Math.random() * remainingMember.length);
      console.log("randomElement: ", randomElement);
      const newCreator = remainingMember[randomElement];
      console.log("newCreator: ", newCreator);

      chat.creator = newCreator;
    }

    chat.members = remainingMember;

    const [user] = await Promise.all([
      Auth.findById(req.user, "name"),
      chat.save(),
    ]);
    console.log("user :", user);

    emitEvent(req, ALERT, chat.members, `User${user.name}has left the group `);

    res.status(200).json({ message: "Member leave group successfully" });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

// is api ka kya kam hain mujha samjhna hai chatgpt sai
const attachment = async (req, res, next) => {
  try {
    // Request body se chatId nikaal rahe hain.
    const { chatId } = req.body;
    console.log("chatId :", chatId);

    // Promise.all use kar ke ek waqt par do queries chala rahe hain:
    // ek Chat ki details lene ke liye aur doosra User ki details lene ke liye.
    const [chat, user] = await Promise.all([
      Chat.findById(chatId), // Chat details find kar rahe hain chatId se.
      Auth.findById(req.user, "name attachments"), // User details find kar rahe hain user id se.
    ]);
    console.log("chat :", chat);
    console.log("user :", user);

    // Agar chat exist nahi karta, toh 404 error return karte hain.
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    //Check karte hain ke files attach hain ya nahi, agar nahi hain toh 400 error bhejte hain.
    const files = req.files || []; // Files ko request se nikaal rahe hain.
    console.log("files :", files);

    if (files.length < 1) {
      return res.status(400).json({ message: "Please Provide attachment" });
    }

    // Files ko Cloudinary pe upload karte hain aur local se delete kar dete hain.
    // Upload the file here
    let attachments = {}; //Empty object create kar rahe hain attachments store karne ke liye.
    console.log("attachments :", attachments);

    if (req?.files && req?.files.length > 0) {
      const localFilePath = path.join(
        __dirname,
        `../uploads/${req.files[0].filename}`
      );
      console.log("localFilePath ", localFilePath);
      const cloudinaryResult = await uploadImage(localFilePath); // Cloudinary pe upload kar rahe hain.
      // console.log("cloudinaryResult ", cloudinaryResult);

      if (cloudinaryResult) {
        attachments.url = cloudinaryResult.url; // URL store kar rahe hain.
        attachments.public_id = cloudinaryResult.public_id; // Public ID store kar rahe hain.
        fs.unlinkSync(localFilePath); // Local file delete kar rahe hain.
      }
    }

    // Phir ek messageForDb object banate hain jo database aur real-time events ke liye use hoga
    const messageForDb = {
      content: "",
      attachments,
      sender: user._id,
      chat: chatId,
    };
    console.log("messageForDb :", messageForDb);

    const messageForRealTime = {
      ...messageForDb,
      sender: {
        _id: user._id,
        name: user.name,
        attachments: user.attachments,
      },
    };
    console.log("messageForRealTime :", messageForRealTime);

    //Message ko database mai save karte hain aur real-time events emit karte hain.
    const message = await Message.create(messageForDb);
    console.log("message: ", message);

    emitEvent(req, NEW_ATTACHMENTS, chat.members, {
      message: messageForRealTime,
      chatId,
    });

    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    res.status(200).json({ message: "Attachments send successfully", message });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

// is api ka kya kam hain mujha samjhna hai chatgpt sai
// is api ka kya kam hain mujha samjhna hai chatgpt sai
const getMessageDetails = async (req, res, next) => {
  try {
    if (req.query.populate === "true") {
      const chat = await Chat.findById(req.params.id)
        .populate("members", "name avatar")
        .lean();
      console.log("chat: ", chat);

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      chat.members = chat.members.map(({ _id, name, avatar }) => ({
        _id,
        name,
        avatar: avatar.url,
      }));

      res.status(200).json({ message: "Get all message details", chat });
    } else {
      const chat = await Chat.findById(req.params.id);
      console.log("chat: ", chat);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.status(200).json({ message: "Get all message details", chat });
    }
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

// is main problem nhi hain lakin ak condition sahi karni hain
// is api ka kya kam hain mujha samjhna hai chatgpt sai
const renameGroupName = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    console.log("chatId: ", chatId);
    const { name } = req.body;
    console.log("name: ", name);
    // const userId = req.user._id;
    // console.log("userId: ", userId);

    const chat = await Chat.findById(chatId).exec();
    console.log("chat: ", chat);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.groupChat) {
      return res.status(400).json({ message: "This is not a group chat" });
    }

    //Check karo ke chat creator aur current user same hain ya nahi,
    // agar nahi hain to 403 status aur "You are not allowed to rename the group name" message return karo.
    // if (chat.creator !== req.user) {
    //   return res
    //     .status(403)
    //     .json({ message: "You are not allowed to rename the group name" });
    // }

    //chat.name ko update karo naye name ke sath aur save karo.
    chat.name = name;

    await chat.save();

    //Event emit karo REFETCH_CHATS jo members ke chats ko refresh karega.
    emitEvent(req, REFETCH_CHATS, chat.members);

    res.status(201).json({ message: "Group name edit successfully", chat });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

// is Api ko test karna hain postman main
// is api ka kya kam hain mujha samjhna hai chatgpt sai
const deleteChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    console.log("chatId: ", chatId);

    const chat = await Chat.findById(chatId);
    console.log("chat: ", chat);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const members = chat.members;
    console.log("members: ", members);

    // if (chat.groupChat && chat.creator.toString() !== req.user.toString()) {
    //   return res
    //     .status(403)
    //     .json({ message: "You are not allowed to delete the group" });
    // }

    if (!chat.groupChat && !chat.members.includes(req.user.toString())) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete the chat" });
    }

    //  Yahan humein sabhi messages aur attachments ya files ko Cloudinary se delete karna hai.
    const messageWithattachments = await Message.find({
      chat: chatId,
      attachments: { $exists: true, $ne: [] },
    });
    console.log("messageWithattachments :", messageWithattachments);

    const public_ids = [];
    console.log("public_ids :", public_ids);

    messageWithattachments.forEach(({ attachments }) => {
      attachments.forEach(({ public_id }) => {
        public_ids.push(public_id);
      });

      const results = Promise.all([
        // Delete from cloudinary
        deleteFromCloudinary(public_ids),
        chat.deleteOne(),
        Message.deleteMany({ chat: chatId }),
      ]);
      console.log("Results:", results);

      emitEvent(req, REFETCH_CHATS, members);

      res.status(200).json({ message: "Chat Deleted succesfully" });
    });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

// is Api ko test karna hain postman main
// is api ka kya kam hain mujha samjhna hai chatgpt sai
const getPaginationMessages = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    console.log("chatId : ", chatId);

    const { page = 1 } = req.query;
    console.log("{ page = 1 } : ", req.query);

    const limit = 20;
    console.log("limit : ", limit);

    const skip = (page - 1) * limit;
    console.log("skip : ", skip);

    const [messages, totalMessagescount] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name avatar").lean,
      Message.countDocuments({ chat: chatId }),
    ]);

    const totalPages = Math.ceil(totalMessagescount / limit) || 0;
    console.log("totalCount: ", totalCount);

    res.status(200).json({ messages: messages.reverce(), totalPages });
  } catch (error) {
    console.log("error :", error);
    next(error);
  }
};

export {
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
};
