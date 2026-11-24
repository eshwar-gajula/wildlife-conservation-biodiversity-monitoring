const mongoose = require("mongoose");

const habitatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    habitatType: {
      type: String,
      required: true,
      enum: [
        "Forest",
        "Grassland",
        "Wetland",
        "Mangrove",
        "Desert",
        "Mountain",
        "Coastal",
        "River",
        "Other"
      ]
    },

    description: {
      type: String,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    area: {
      type: Number,
      min: 0
    },

    areaUnit: {
      type: String,
      enum: ["sq_km", "hectare", "acre"],
      default: "sq_km"
    },

    climate: {
      type: String,
      trim: true
    },

    associatedSpecies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Species"
      }
    ],

    associatedSpeciesNames: [
      {
        type: String,
        trim: true
      }
    ],

    threats: {
      type: String,
      trim: true
    },

    images: [
      {
        type: String
      }
    ],

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
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

module.exports = mongoose.model("Habitat", habitatSchema);