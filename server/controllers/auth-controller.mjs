// What is JWT
// authentication ka matlab hai ka ap kisi ko identify kar raha ho kya ya wohi user hai ya nahi
// authorization ka matlab hain ovens ap nai identify kar lya ka ya wohi person hai ya nahi
// to is ki base pa ap is person ko kuch access do ga

// Headers
// token ka bhi go information rakta ho
// Payload
// payload main hum user ki information add kar sakta hain asa identity
// Signature
// signature ka matla hain gaha par ak asa signature ho ga ya value ho ga go server ko pata hota hain

// JWT NOT STORE IN DATABASE
// jwt ka token ko apna cliet site browser par store karna hain like localStorge | cookies

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/auth-model.mjs";
import uploadImage from "../config/cloudinaryConfig.mjs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
// console.log("__filename :", __filename);
const __dirname = dirname(__filename);
// console.log("__dirname :", __dirname);

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("name, email, password, role :", req.body);
    let avatar = {};
    console.log("avatar :", avatar);

    if (req?.files && req?.files.length > 0) {
      const localFilePath = path.join(
        __dirname,
        `../uploads/${req.files[0].filename}`
      );
      console.log("localFilePath ", localFilePath);
      const cloudinaryResult = await uploadImage(localFilePath);
      console.log("cloudinaryResult ", cloudinaryResult);

      if (cloudinaryResult) {
        avatar.url = cloudinaryResult.url;
        avatar.public_id = cloudinaryResult.public_id;
        fs.unlinkSync(localFilePath); // Delete file after upload
      }
    }

    if (!name || !email || !password || !avatar) {
      return res.status(403).json({ message: "Required parameters missing" });
    }

    const userEmail = await User.findOne({ email: email.toLowerCase() });
    if (userEmail) {
      return res.status(403).json({ message: "User email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userCreated = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "user",
      avatar,
    });

    console.log("userCreated: ", userCreated);

    res.status(201).json({ message: "Registration successful", userCreated });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email, password ", req.body);

    if (!email || !password) {
      return res
        .status(403)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    console.log("login user :", user);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(404).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15h" }
    );
    console.log("Login token :", token);
    res
      .status(201)
      .cookie("Hassan_Nadeem", token, {
        maxage: 15 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .json({ message: `Login successful in ${user.name}`, token, user });
  } catch (error) {
    next(error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    console.log("user :", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "getMyProfile route successful", user });
  } catch (error) {
    next(error);
    console.log("error :", error);
  }
};
const logout = (req, res, next) => {
  try {
    res
      .status(200)
      .cookie("Hassan_Nadeem", "", {
        maxage: 0,
        sameSite: "none",
        httpOnly: true,
        secure: true,
      })
      .json({ message: "Logout successful" });
  } catch (error) {
    next(error);
    console.log("error :", error);
  }
};
const SearchUser = (req, res, next) => {
  try {
    const { name } = req.query;
    res.status(200).json({ message: name });
  } catch (error) {
    next(error);
    console.log("error :", error);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, newPassword, answer } = req.body;

    if (!email || !newPassword || !answer) {
      return res.status(403).json({ message: "Required parameters missing" });
    }

    const user = await User.findOne({ email: email.toLowerCase(), answer });
    if (!user) {
      return res.status(403).json({ message: "Wrong email or answer" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne({ _id: user._id }, { password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export { register, login, getMyProfile, logout, SearchUser };
