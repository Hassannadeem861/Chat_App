import express from "express";
import cors from "cors";
import colors from "colors";
import morgan from "morgan";
import errorMidleWare from "./middle-ware/error.middleware.mjs";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.mjs";
import authRouter from "./routes/auth-route.mjs";
import chatRoute from "./routes/chat.mjs";

// Create an instance of the express application
const app = express();
// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectDB();

// CORS options
const corsOptions = {
  origin: "http://localhost:8081",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());


// Middleware to parse URL-encoded requests
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", authRouter);
app.use("/api/v1", chatRoute);
app.use(errorMidleWare);


// Simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to hassan nadeem application." });
});

// Set port and listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`.bgBlue.white);
});
