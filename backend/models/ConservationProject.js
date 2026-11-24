const mongoose = require("mongoose");

const conservationProjectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true
    },

    objective: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    targetSpecies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Species"
      }
    ],

    targetHabitats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habitat"
      }
    ],

    activities: [
      {
        type: String,
        trim: true
      }
    ],

    location: {
      type: String,
      required: true,
      trim: true
    },

    budget: {
      type: Number,
      min: 0,
      default: 0
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    status: {
      type: String,
      enum: [
        "planned",
        "active",
        "completed",
        "cancelled"
      ],
      default: "planned"
    },

    assignedFieldOfficers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    assignedResearchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    images: [
      {
        type: String
      }
    ],

    adminRemarks: {
      type: String,
      trim: true,
      default: ""
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ConservationProject",
  conservationProjectSchema
);
