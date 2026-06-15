const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true },
    subject: { type: String, default: "General Enquiry" },
    message: { type: String, required: true, trim: true },
    status:  {
      type:    String,
      enum:    ["New", "Read", "Replied", "Closed"],
      default: "New",
    },
    adminNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contact", contactSchema);
