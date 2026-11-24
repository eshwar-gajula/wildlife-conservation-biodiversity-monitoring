const Sighting = require("../models/Sighting");
const Incident = require("../models/Incident");
const Habitat = require("../models/Habitat");

// GET WILDLIFE MAP DATA
const getWildlifeMapData = async (req, res) => {
  try {

    // Get verified sightings
    const sightings = await Sighting.find({
      verificationStatus: "verified"
    })
      .populate(
        "species",
        "commonName scientificName conservationStatus"
      )
      .populate(
        "reportedBy",
        "name role"
      )
      .sort({ sightingDate: -1 });


    // Get confirmed/active/resolved incidents
    const incidents = await Incident.find({
      status: {
        $in: [
          "confirmed",
          "in_progress",
          "resolved",
          "closed"
        ]
      }
    })
      .populate(
        "reportedBy",
        "name role"
      )
      .populate(
        "assignedOfficer",
        "name"
      )
      .sort({ createdAt: -1 });


    // Get active habitats
    const habitats = await Habitat.find({
      status: "active"
    })
      .populate(
        "associatedSpecies",
        "commonName scientificName"
      )
      .sort({ createdAt: -1 });


    // Send response
    res.status(200).json({
      success: true,
      sightings,
      incidents,
      habitats
    });

  } catch (error) {

    console.error("Wildlife Map Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch wildlife map data",
      error: error.message
    });

  }
};

module.exports = {
  getWildlifeMapData
};