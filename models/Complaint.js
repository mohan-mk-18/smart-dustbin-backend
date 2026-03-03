const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    message: String,
    image: String,
    status: {
      type: String,
      enum: ["pending", "cleared"], // only lowercase allowed
      default: "pending",
      lowercase: true, // auto converts to lowercase before saving
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);