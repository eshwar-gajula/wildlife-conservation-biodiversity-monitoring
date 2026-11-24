const mongoose = require("mongoose");

const researchObservationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    researcher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConservationProject",
      default: null
    },

    species: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Species"
      }
    ],

    habitats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habitat"
      }
    ],

    observationDate: {
      type: Date,
      required: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    coordinates: {
      type: [Number],
      default: []
    },

    methodology: {
      type: String,
      trim: true
    },

    observation: {
      type: String,
      required: true,
      trim: true
    },

    findings: {
      type: String,
      trim: true
    },

    conclusion: {
      type: String,
      trim: true
    },

    recommendations: {
      type: String,
      trim: true
    },

    attachments: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "completed"
      ],
      default: "draft"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "ResearchObservation",
  researchObservationSchema
);