import express from "express";
import {
  register,
  login,
  getMyProfile,
  logout,
  SearchUser,
} from "../controllers/auth-controller.mjs";
import { authMiddleware, adminMiddleWare } from "../middle-ware/auth.mjs";
// import upload from '../middle-ware/multer.middleware.mjs';
import { signupSchema, loginSchema } from "../validations/auth.validation.mjs";
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
  "/register",
  uploadMiddleware.any(),
  validate(signupSchema),
  register
);
router.post("/login", login);

router.get("/get-my-profile", authMiddleware, getMyProfile);
router.get("/search", authMiddleware, SearchUser);
router.get("/logout", authMiddleware, logout);

// router.post("/forget-password", forget);

// router.get('/test', authMiddleware, adminMiddleWare, protectController);

// router.get('/user/dashboard', authMiddleware, (req, res) => {
//   res.status(200).send({ ok: true });
// });

// router.get('/admin/dashboard', authMiddleware, adminMiddleWare, (req, res) => {
//   res.status(200).send({ ok: true });
// });

export default router;

// const storageConfig = multer.diskStorage({
//     destination: './uploads/',
//     filename: function (req, file, cb) {
//       console.log("Multer file: ", file);
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
//   });

//   const uploadMiddleware = multer({ storage: storageConfig });
