const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

// GET all complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new complaint
router.post("/", async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    const saved = await newComplaint.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE complaint status (STANDARDIZED)
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