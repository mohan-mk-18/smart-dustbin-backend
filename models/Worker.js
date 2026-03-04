const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
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
  photo: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("Worker", workerSchema);