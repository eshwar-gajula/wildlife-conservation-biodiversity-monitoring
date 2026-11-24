const mongoose = require("mongoose");

const sightingSchema = new mongoose.Schema(
  {
    species: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Species",
      required: true
    },

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
      enum: [
        "field_officer",
        "public_user"
      ],
      required: true
    },

    sightingDate: {
      type: Date,
      required: true
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

    animalCount: {
      type: Number,
      required: true,
      min: 1
    },

    behavior: {
      type: String,
      trim: true
    },

    condition: {
      type: String,
      enum: [
        "Healthy",
        "Injured",
        "Sick",
        "Dead",
        "Unknown"
      ],
      default: "Unknown"
    },

    description: {
      type: String,
      trim: true
    },

    photos: [
      {
        type: String
      }
    ],

    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected"
      ],
      default: "pending"
    },

    adminRemarks: {
      type: String,
      trim: true
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);


// GeoJSON index for map/location queries
sightingSchema.index({
  coordinates: "2dsphere"
});


module.exports = mongoose.model(
  "Sighting",
  sightingSchema
);