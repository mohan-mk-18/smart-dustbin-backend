const express = require("express");
const router = express.Router();
const Worker = require("../models/Worker");

/* =========================================
   GET — All Workers
========================================= */
router.get("/", async (req, res) => {
  try {
    const workers = await Worker.find().sort({ name: 1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   POST — Create Worker
========================================= */
router.post("/", async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();

    res.status(201).json({
      message: "Worker created successfully",
      data: worker
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   PATCH — Update Worker
========================================= */
router.patch("/:id", async (req, res) => {
  try {
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      message: "Worker updated",
      data: updatedWorker
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   DELETE — Remove Worker
========================================= */
router.delete("/:id", async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);

    res.json({
      message: "Worker deleted"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;