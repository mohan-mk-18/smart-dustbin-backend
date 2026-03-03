const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    message: String,
    image: String,
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);