const mongoose = require("mongoose");

const schoolSchema = mongoose.Schema({
  name: { type: String, unique: true, required: true },
  logo: String,
  classes: {
    type: [
      {
        className: String,
        subjects: [],
      },
    ],
    default: [],
  },
  teachers: { type: [], default: [] },
  students: { type: [], default: [] },
  subjects: { type: [], default: [] },
  adminDetails: { type: String },
});

const schoolModel = mongoose.model("school", schoolSchema);
module.exports = schoolModel;
