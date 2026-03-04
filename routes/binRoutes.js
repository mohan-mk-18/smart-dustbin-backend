const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

/* =========================================
   GET — All Bins
========================================= */
router.get("/", async (req, res) => {
  try {
    const bins = await Bin.find().sort({ binId: 1 });
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   POST — Create or Update Bin (Sensor Data)
   IMPORTANT: Does NOT overwrite lock state
========================================= */
router.post("/", async (req, res) => {
  try {
    const { binId, distance, fillStatus, gasValue, gasStatus, rfidAccess } = req.body;

    if (!binId) {
      return res.status(400).json({ error: "binId is required" });
    }

    const updatedBin = await Bin.findOneAndUpdate(
      { binId },
      {
        distance,
        fillStatus,
        gasValue,
        gasStatus,
        rfidAccess,
        timestamp: new Date()
      },
      {
        new: true,
        upsert: true
      }
    );

    res.status(200).json({
      message: "Bin data saved successfully",
      data: updatedBin
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   GET — Single Bin by ID
========================================= */
router.get("/:binId", async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });

    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }

    res.json(bin);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   PATCH — Toggle Lock (Admin Control)
========================================= */
router.patch("/:binId/lock", async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });

    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }

    bin.locked = !bin.locked;
    await bin.save();

    res.json({
      message: "Lock state updated",
      data: bin
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;