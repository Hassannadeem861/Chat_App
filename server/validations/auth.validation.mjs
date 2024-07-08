import { z } from "zod";

// Creating an object schema
const signupSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at lest of 3 charactors.." })
    .max(10, { message: "Name must be at lest of 10 charactors.." }),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .min(10, { message: "Email must be at lest of 10 charactors.." })
    .max(20, { message: "Email must be at lest of 20 charactors.." }),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    // .email({ message: "Invalid email address" })
    .min(6, { message: "Password must be at lest of 6 charactors.." })
    .max(10, { message: "Password must be at lest of 10 charactors.." }),

  role: z
    .string({ required_error: "Role is required" })
    .trim()
    // .email({ message: "Invalid email address" })
    .min(3, { message: "Password must be at lest of 3 charactors.." })
    .max(10, { message: "Password must be at lest of 10 charactors.." }),

  avatar: z.string({ required_error: "Please Upload Avatar" }),
});
// console.log("signupSchema: ", signupSchema);

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .min(10, { message: "Email must be at lest of 10 charactors.." })
    .max(30, { message: "Email must be at lest of 30 charactors.." }),

  password: z
    .string({ required_error: "Password is required" })
    .trim()
    // .email({ message: "Invalid email address" })
    .min(6, { message: "Password must be at lest of 6 charactors.." })
    .max(30, { message: "Password must be at lest of 30 charactors.." }),
});

const createGroupSchema = z.object({
  name: z
    .string({ required_error: "Please provide Group name" })
    .trim()
    .min(5, { message: "Name must be at lest of 5 charactors.." })
    .max(10, { message: "Name must be at lest of 10 charactors.." }),

  members: z
    .string({ required_error: "Please provide members" })
    .trim()
    .min(2, { message: "members must be at lest of 2" })
    .max(50, { message: "members must be at lest of 50." }),
});

const addMembersSchema = z.object({
  chatId: z.string({ required_error: "Please provide chatId" }),
  // .trim()
  // .min(5, { message: "Name must be at lest of 5 charactors.." })
  // .max(10, { message: "Name must be at lest of 10 charactors.." }),

  members: z
    .string({ required_error: "Please provide members" })
    .trim()
    .min(1, { message: "Add members must be at least 1" })
    .max(47, { message: "Add members must be at least 47" }),
});

const removeMembersSchema = z.object({
  chatId: z.string({ required_error: "Please provide chatId" }),
  userId: z.string({ required_error: "Please provide userId" }),
});

const leaveGroupSchema = z.object({
  id: z.string({ required_error: "Please provide chatId" }),
});

const sendAttachmentsSchema = z.object({
  chatId: z.string({ required_error: "Please provide chatId" }),
  files: z
    .string({ required_error: "Please Upload Attachments" })
    .trim()
    .min(1, { message: "Attachments must be at least 1" })
    .max(5, { message: "Attachments must be at least 5" }),
});

const getPaginationSchema = z.object({
  id: z.string({ required_error: "Please provide chatId" }),
});

const getMessageDetalsSchema = z.object({
  id: z.string({ required_error: "Please provide chatId" }),
});

const renameGroupNameSchema = z.object({
  chatId: z.string({ required_error: "Please provide chatId" }),
  name: z
    .string({ required_error: "Please provide name" })
    .trim()
    .min(6, { message: "name must be at least 6" })
    .max(20, { message: "name must be at least 20" }),
});

const deleteChatSchema = z.object({
  chatId: z.string({ required_error: "Please provide chatId" }),
});

// export  default signupSchema;
export {
  signupSchema,
  loginSchema,
  createGroupSchema,
  addMembersSchema,
  removeMembersSchema,
  leaveGroupSchema,
  sendAttachmentsSchema,
  getPaginationSchema,
  getMessageDetalsSchema,
  renameGroupNameSchema,
  deleteChatSchema
};
