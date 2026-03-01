const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

// POST — Receive data from ESP32
router.post("/", async (req, res) => {
  try {
    const newData = new Bin(req.body);
    await newData.save();
    res.status(201).json({ message: "Data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET — Get latest bin data
router.get("/latest", async (req, res) => {
  try {
    const latestData = await Bin.findOne().sort({ timestamp: -1 });
    res.json(latestData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET — Get full history
router.get("/history", async (req, res) => {
  try {
    const history = await Bin.find().sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;