// config/cloudinary.mjs
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

const uploadImage = async (filePath) => {
  try {
    const response = await cloudinary.uploader.upload(filePath, {
      folder: "uploads",
      resource_type: "auto",
    });
    // console.log("response in cloudnary: ", response?.public_id);
    console.log("response in cloudnary: ", response?.url);
    return response;
  } catch (error) {
    console.error(
      "Error uploading to Cloudinary:",
      JSON.stringify(error, null, 2)
    );
    return null;
  }
};

export default uploadImage;

// // config/cloudinary.mjs
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "do9htnqk5",
//   api_key: process.env.CLOUDINARY_API_KEY || "441572692987476",
//   api_secret: process.env.CLOUDINARY_API_SECRET || "Hassan_Nadeem",
// });

// const uploadFileInCloudnary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });
//     console.log("response in cloudnary: ", response?.public_id);
//     console.log("response in cloudnary: ", response?.url);
//     return response;
//   } catch (error) {
//     console.log("uploadFileInCloudnary: ", error);
//     fs.unlinkSync(localFilePath);
//     return null;
//   }
// };

// export default uploadFileInCloudnary;
