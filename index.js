require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Initial Connection Error:", err);
  });

// Listen for connection events
mongoose.connection.on("error", (err) => {
  console.error("MongoDB Runtime Error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB Disconnected...");
});

// Routes
const binRoutes = require("./routes/binRoutes");
app.use("/api/bin", binRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});