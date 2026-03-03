const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

/*
  @route   POST /api/complaints
  @desc    Create new complaint
*/
router.post("/", async (req, res) => {
  try {
    const { name, message, image } = req.body;

    const newComplaint = new Complaint({
      name,
      message,
      image,
      status: "pending",
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json(savedComplaint);
  } catch (error) {
    res.status(500).json({ message: "Error saving complaint", error });
  }
});

/*
  @route   GET /api/complaints
  @desc    Get all complaints (Admin)
*/
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching complaints", error });
  }
});

/*
  @route   PUT /api/complaints/:id/clear
  @desc    Mark complaint as cleared
*/
router.put("/:id/clear", async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "cleared" },
      { new: true }
    );

    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: "Error clearing complaint", error });
  }
});

module.exports = router;