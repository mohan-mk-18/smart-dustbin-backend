const express = require("express");
const router = express.Router();
const Worker = require("../models/Worker");

/* =========================================
   POST — RFID Access Check
========================================= */
router.post("/", async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        access: "DENIED",
        message: "UID is required"
      });
    }

    const worker = await Worker.findOne({ uid });

    if (!worker) {
      return res.status(403).json({
        access: "DENIED",
        message: "Unauthorized card"
      });
    }

    res.json({
      access: "GRANTED",
      worker: worker.name,
      uid: worker.uid
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;