require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const complaintRoutes = require("./routes/complaintRoutes");
const binRoutes = require("./routes/binRoutes");
const workerRoutes = require("./routes/workerRoutes");
const rfidRoutes = require("./routes/rfidRoutes"); // ✅ NEW

const app = express();

/* ===========================
   Middlewares
=========================== */

app.use(cors());
app.use(express.json());

/* ===========================
   Root Route (Health Check)
=========================== */

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Smart Dustbin Backend Running 🚀",
    status: "OK"
  });
});

/* ===========================
   API Routes
=========================== */

app.use("/complaints", complaintRoutes);
app.use("/bins", binRoutes);
app.use("/workers", workerRoutes);
app.use("/rfid-access", rfidRoutes); // ✅ NEW

/* ===========================
   404 Handler (Important)
=========================== */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/* ===========================
   MongoDB Connection
=========================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });

  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });