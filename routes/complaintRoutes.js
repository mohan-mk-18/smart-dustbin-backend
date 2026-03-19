const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ==============================
   MULTER CONFIG (FIXED)
============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";

    // create folder if not exists (important for Render)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ✅ IMPORTANT LINE
const upload = multer({ storage });

/* ==============================
   GET ALL COMPLAINTS
============================== */
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ==============================
   POST NEW COMPLAINT (FINAL FIX)
============================== */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, phone, location, message } = req.body;

    const newComplaint = new Complaint({
      name,
      phone,
      location,
      message,
      image: req.file ? req.file.filename : "",
    });

    const saved = await newComplaint.save();

    res.status(201).json(saved);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(400).json({ message: err.message });
  }
});

/* ==============================
   UPDATE COMPLAINT STATUS
============================== */
router.patch("/:id", async (req, res) => {
  try {
    let { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    status = status.toLowerCase().trim();

    if (!["pending", "cleared"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;