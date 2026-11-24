const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConservationProject",
      default: null
    },

    reporterRole: {
      type: String,
      enum: ["field_officer", "public_user"],
      required: true
    },

    incidentType: {
      type: String,
      enum: [
        "poaching",
        "forest_fire",
        "animal_injury",
        "illegal_hunting",
        "animal_death",
        "habitat_destruction",
        "human_wildlife_conflict",
        "other"
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },

      coordinates: {
        type: [Number],
        required: true
      }
    },

    severity: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
        "critical"
      ],
      default: "medium"
    },

    photos: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "rejected",
        "in_progress",
        "resolved",
        "closed"
      ],
      default: "pending"
    },

    adminRemarks: {
      type: String,
      trim: true,
      default: ""
    },

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    confirmedAt: {
      type: Date,
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    closedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

incidentSchema.index({
  coordinates: "2dsphere"
});

module.exports = mongoose.model(
  "Incident",
  incidentSchema
);