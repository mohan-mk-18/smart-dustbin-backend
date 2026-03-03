const mongoose = require("mongoose");

const binSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    unique: true
  },
  distance: {
    type: Number,
    required: true
  },
  fillStatus: {
    type: String,
    required: true
  },
  gasValue: {
    type: Number,
    required: true
  },
  gasStatus: {
    type: String,
    required: true
  },
  rfidAccess: {
    type: String,
    default: "None"
  },
  locked: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Bin", binSchema);