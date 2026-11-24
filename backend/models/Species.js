const mongoose = require("mongoose");

const speciesSchema = new mongoose.Schema(
  {
    commonName: {
      type: String,
      required: true,
      trim: true
    },

    scientificName: {
      type: String,
      required: true,
      trim: true
    },

    family: {
      type: String,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    conservationStatus: {
      type: String,
      enum: [
        "Least Concern",
        "Near Threatened",
        "Vulnerable",
        "Endangered",
        "Critically Endangered",
        "Extinct in the Wild",
        "Extinct"
      ],
      default: "Least Concern"
    },

    population: {
      type: Number,
      min: 0
    },

    diet: {
      type: String,
      trim: true
    },

    behavior: {
      type: String,
      trim: true
    },

    physicalDescription: {
      type: String,
      trim: true
    },

    habitat: {
      type: String,
      trim: true
    },

    distribution: {
      type: String,
      trim: true
    },

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

module.exports = mongoose.model("Species", speciesSchema);