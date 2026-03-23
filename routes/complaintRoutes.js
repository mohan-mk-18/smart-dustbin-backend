const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

const multer = require("multer");

/* ==============================
   CLOUDINARY CONFIG
============================== */
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "smart-dustbin",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

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
   POST NEW COMPLAINT (CLOUDINARY)
============================== */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, email, location, message } = req.body;

    const newComplaint = new Complaint({
      name,
      email,
      location,
      message,
      image: req.file ? req.file.path : "", // ✅ Cloudinary URL
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