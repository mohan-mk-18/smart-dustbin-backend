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
    if (!bin) return res.status(404).json({ error: "Bin not found" });
    res.json(addOnlineStatus(bin));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   GET — BIN STATUS (FOR ESP POLLING)
========================================= */
router.get("/:binId/status", async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });
    if (!bin) return res.status(404).json({ error: "Bin not found" });

    res.json({
      locked: bin.locked,
      adminUnlocked: bin.adminUnlocked
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   POST — CREATE OR UPDATE BIN (ESP DATA)

   LOGIC:
   - FULL + adminUnlocked=true  → skip auto-lock
     (admin opened it, worker is collecting)
   - FULL + adminUnlocked=false → auto-lock
     (normal full bin, no override)
   - ACTIVE → always unlock AND clear adminUnlocked
     (bin emptied, worker done, override no longer needed)
========================================= */
router.post("/", verifyAPI, async (req, res) => {
  try {
    const { binId, fillStatus } = req.body;

    if (!binId) {
      return res.status(400).json({ error: "binId is required" });
    }

    const existingBin = await Bin.findOne({ binId });

    let updateData = { ...req.body };

    if (fillStatus === "ACTIVE") {

      // Bin has been emptied — always unlock and clear the
      // admin override so the next FULL cycle works correctly
      updateData.locked = false;
      updateData.adminUnlocked = false;

    } else if (fillStatus === "FULL") {

      // Only auto-lock if admin has NOT manually unlocked it
      if (!existingBin || !existingBin.adminUnlocked) {
        updateData.locked = true;
      }
      // If adminUnlocked is true, leave locked as-is —
      // worker is currently collecting, don't interfere
    }

    const updatedBin = await Bin.findOneAndUpdate(
      { binId },
      updateData,
      { new: true, upsert: true }
    );

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
router.patch("/:binId/lock", async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });
    if (!bin) return res.status(404).json({ error: "Bin not found" });

    bin.locked = !bin.locked;

    if (!bin.locked) {
      bin.adminUnlocked = true;
    } else {
      bin.adminUnlocked = false;
    }

    await bin.save();

    const io = req.app.get("io");
    io.emit("binUpdated", { binId: bin.binId });

    res.json({
      message: "Lock state updated",
      locked: bin.locked,
      adminUnlocked: bin.adminUnlocked
    });

  } catch (error) {
    console.error("LOCK ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   PATCH — RESET ADMIN UNLOCK (ESP CALLS THIS)
   After the 10s window expires and bin is
   still physically full
========================================= */
router.patch("/:binId/reset-admin-unlock", verifyAPI, async (req, res) => {
  try {
    const bin = await Bin.findOne({ binId: req.params.binId });
    if (!bin) return res.status(404).json({ error: "Bin not found" });

    bin.adminUnlocked = false;
    bin.locked = true;

    await bin.save();

    const io = req.app.get("io");
    io.emit("binUpdated", { binId: bin.binId });

    res.json({ message: "Admin unlock reset", locked: bin.locked });

  } catch (error) {
    console.error("RESET ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   DEMO MODE
========================================= */
router.patch("/:binId/demo", async (req, res) => {
  try {
    const { fillStatus, gasStatus } = req.body;

    const bin = await Bin.findOne({ binId: req.params.binId });
    if (!bin) return res.status(404).json({ error: "Bin not found" });

    if (fillStatus) {
      bin.fillStatus = fillStatus;
      if (fillStatus === "FULL") {
        bin.locked = true;
        bin.adminUnlocked = false;
      }
      if (fillStatus === "ACTIVE") {
        bin.locked = false;
        bin.adminUnlocked = false;
      }
    }

    if (gasStatus) {
      bin.gasStatus = gasStatus;
    }

    await bin.save();

    const io = req.app.get("io");
    io.emit("binUpdated", { binId: bin.binId });

    res.json({ message: "Demo update successful", data: bin });

  } catch (error) {
    console.error("DEMO ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;