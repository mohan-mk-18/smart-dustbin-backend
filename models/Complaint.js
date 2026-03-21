const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    name: String,
    email: String, // ✅ ADD THIS LINE ONLY
    location: String,
    message: String,
    image: String,
    status: {
      type: String,
      enum: ["pending", "cleared"],
      default: "pending",
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);