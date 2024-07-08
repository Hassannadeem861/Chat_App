// // // middleware/multer.mjs
// // import multer from 'multer';
// // import { CloudinaryStorage } from 'multer-storage-cloudinary';
// // import cloudinary from '../config/cloudinaryConfig.mjs';

// // // Multer-Cloudinary storage configuration
// // const storage = new CloudinaryStorage({
// //     cloudinary: cloudinary,
// //     params: {
// //         folder: 'uploads', // Folder name in Cloudinary
// //         allowedFormats: ['jpg', 'png', 'jpeg'],
// //     },
// // });

// // // File validation
// // const fileFilter = (req, file, cb) => {
// //     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
// //     if (allowedTypes.includes(file.mimetype)) {
// //         cb(null, true);
// //     } else {
// //         cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'), false);
// //     }
// // };

// // const upload = multer({
// //     storage: storage,
// //     fileFilter: fileFilter,
// //     limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
// // });

// // export default upload;

// // middleware/multer.mjs
// // import multer from "multer";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // // For ES modules
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Multer configuration for local storage
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, "uploads/"); // Local uploads directory
// //   },
// //   filename: function (req, file, cb) {
// //     cb(null, `${Date.now()}-${file.originalname}`);
// //   },
// // });

// // // File validation
// // const fileFilter = (req, file, cb) => {
// //   const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
// //   if (allowedTypes.includes(file.mimetype)) {
// //     cb(null, true);
// //   } else {
// //     cb(
// //       new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
// //       false
// //     );
// //   }
// // };


// // const upload = multer({
// //   storage: storage,
// //   fileFilter: fileFilter,
// //   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
// // });

// // export default upload;

// // middleware/multer.mjs
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// // For ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// // Multer configuration for local storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadsDir); // Local uploads directory
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// // File validation
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
// });

// export default upload;
