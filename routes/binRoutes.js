const express = require("express");
const router = express.Router();
const Bin = require("../models/Bin");

/* =========================================
   ONLINE THRESHOLD (SECONDS)
========================================= */
const ONLINE_THRESHOLD = 10;

/* =========================================
   HELPER FUNCTION
========================================= */
function addOnlineStatus(bin) {
  const now = new Date();
  const last = new Date(bin.updatedAt);

  const diff = (now - last) / 1000;

  return {
    ...bin._doc,
    isOnline: diff < ONLINE_THRESHOLD
  };
}

/* =========================================
   API KEY SECURITY
========================================= */
function verifyAPI(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  next();
}

/* =========================================
   GET — All Bins
========================================= */
router.get("/", async (req, res) => {
  try {
    const bins = await Bin.find().sort({ binId: 1 });

    const binsWithStatus = bins.map(bin => addOnlineStatus(bin));

    res.json(binsWithStatus);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   GET — Single Bin
========================================= */
router.get("/:binId", async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });

    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }

    res.json(addOnlineStatus(bin));

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   GET — BIN STATUS (FOR ESP)
========================================= */
router.get("/:binId/status", async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });

    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }

    res.json({
      locked: bin.locked
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   POST — CREATE OR UPDATE BIN (ESP DATA)
========================================= */
router.post("/", verifyAPI, async (req, res) => {
  try {
    const { binId, fillStatus } = req.body;

    if (!binId) {
      return res.status(400).json({ error: "binId is required" });
    }

    let updateData = { ...req.body };

    /* AUTO LOCK */
    if (fillStatus === "FULL") {
      updateData.locked = true;
    }

    if (fillStatus === "ACTIVE") {
      updateData.locked = false;
    }

    const updatedBin = await Bin.findOneAndUpdate(
      { binId: binId },
      updateData,
      {
        new: true,
        upsert: true
      }
    );

    /* 🔥 REAL-TIME EMIT */
    const io = req.app.get("io");
    io.emit("binUpdated", { binId });

    res.status(200).json({
      message: "Bin data saved successfully",
      data: updatedBin
    });

  } catch (error) {
    console.error("POST ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   PATCH — TOGGLE LOCK (ADMIN CONTROL)
========================================= */
router.patch("/:binId/lock", verifyAPI, async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });

    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }

    bin.locked = !bin.locked;

    await bin.save();

    /* 🔥 REAL-TIME EMIT */
    const io = req.app.get("io");
    io.emit("binUpdated", { binId: bin.binId });

    res.json({
      message: "Lock state updated",
      data: bin
    });

  } catch (error) {
    console.error("LOCK ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   DEMO MODE - FORCE BIN STATUS
========================================= */
router.patch("/:binId/demo", async (req, res) => {
  try {
    const { fillStatus, gasStatus } = req.body;

    const bin = await Bin.findOne({ binId: req.params.binId });

    if (!bin) {
      return res.status(404).json({ error: "Bin not found" });
    }

    if (fillStatus) {
      bin.fillStatus = fillStatus;

      if (fillStatus === "FULL") {
        bin.locked = true;
      }

      if (fillStatus === "ACTIVE") {
        bin.locked = false;
      }
    }

    if (gasStatus) {
      bin.gasStatus = gasStatus;
    }

    await bin.save();

    /* 🔥 REAL-TIME EMIT */
    const io = req.app.get("io");
    io.emit("binUpdated", { binId: bin.binId });

    res.json({
      message: "Demo update successful",
      data: bin
    });

  } catch (error) {
    console.error("DEMO ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;