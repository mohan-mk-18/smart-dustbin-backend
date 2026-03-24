require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

/* 🔥 NEW: SOCKET SETUP */
const http = require("http");
const { Server } = require("socket.io");

const complaintRoutes = require("./routes/complaintRoutes");
const binRoutes = require("./routes/binRoutes");
const workerRoutes = require("./routes/workerRoutes");
const rfidRoutes = require("./routes/rfidRoutes");

const app = express();

/* ===========================
   CREATE SERVER + SOCKET
=========================== */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);
});

/* ===========================
   Middlewares
=========================== */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

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
app.use("/rfid-access", rfidRoutes);

/* ===========================
   404 Handler
=========================== */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

/* ===========================
   MongoDB Connection + START SERVER
=========================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    /* 🔥 IMPORTANT: USE server.listen */
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });

  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
  });