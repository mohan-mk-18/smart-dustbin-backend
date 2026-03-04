const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    uid: {
      type: String,
      required: true,
      unique: true
    },

    location: {
      type: String,
      required: true
    },

    address: {
      type: String,
      default: ""
    },

    area: {
      type: String,
      default: ""
    },

    photo: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Worker", workerSchema);