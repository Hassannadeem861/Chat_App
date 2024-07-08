import mongoose from "mongoose";

const mongodbURI =
  process.env.mongodbURI ||
  "mongodb+srv://Hassan_Nadeem:Hassan741883@cluster0.1zwgsql.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(mongodbURI);
    console.log("Mongoose is connected");
  } catch (err) {
    console.error("Mongoose connection error: ", err);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose is disconnected");
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("App is terminating");
  mongoose.connection.close(() => {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});

export default connectDB;
