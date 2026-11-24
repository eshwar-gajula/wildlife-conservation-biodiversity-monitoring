const Sighting = require("../models/Sighting");
const Species = require("../models/Species");
const ConservationProject = require("../models/ConservationProject");

const uploadSightingPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "An image file is required" });
  }

  res.status(201).json({
    message: "Field photo uploaded successfully",
    url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
  });
};
// ==========================================
// CREATE SIGHTING
// FIELD OFFICER / PUBLIC USER
// ==========================================
const createSighting = async (req, res) => {
  try {
    const {
      species,
      project,
      sightingDate,
      location,
      coordinates,
      animalCount,
      behavior,
      condition,
      description,
      photos
    } = req.body;


    // Required fields
    if (
      !species ||
      !sightingDate ||
      !location ||
      !coordinates ||
      !animalCount
    ) {
      return res.status(400).json({
        message:
          "Species, date, location, coordinates and animal count are required"
      });
    }

    if (project) {
      const assignedProject = await ConservationProject.findOne({
        _id: project,
        assignedFieldOfficers: req.user._id
      });
      if (!assignedProject) {
        return res.status(403).json({ message: "You are not assigned to this project" });
      }
    }


    // Check species exists
    const existingSpecies = await Species.findById(species);

    if (!existingSpecies) {
      return res.status(404).json({
        message: "Species not found"
      });
    }


    // Validate coordinates
    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        message:
          "Coordinates must contain longitude and latitude"
      });
    }


    const sighting = await Sighting.create({
      species,
      reportedBy: req.user._id,
      project: project || null,
      reporterRole: req.user.role,
      sightingDate,
      location,
      coordinates: {
        type: "Point",
        coordinates
      },
      animalCount,
      behavior,
      condition,
      description,
      photos: photos || [],
      verificationStatus: "pending"
    });


    const populatedSighting =
      await Sighting.findById(sighting._id)
        .populate(
          "species",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "reportedBy",
          "name email role"
        );


    res.status(201).json({
      message: "Sighting submitted successfully",
      sighting: populatedSighting
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create sighting",
      error: error.message
    });
  }
};


// ==========================================
// GET OWN SIGHTINGS
// ==========================================

const getMySightings = async (req, res) => {
  try {

    const sightings = await Sighting.find({
      reportedBy: req.user._id
    })
      .populate(
        "species",
        "commonName scientificName conservationStatus"
      )
      .sort({ createdAt: -1 });


    res.status(200).json({
      count: sightings.length,
      sightings
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your sightings",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL SIGHTINGS
// ADMIN
// ==========================================

const getAllSightings = async (req, res) => {
  try {

    const sightings = await Sighting.find()
      .populate(
        "species",
        "commonName scientificName conservationStatus"
      )
      .populate(
        "reportedBy",
        "name email role"
      )
      .populate(
        "verifiedBy",
        "name email role"
      )
      .sort({ createdAt: -1 });


    res.status(200).json({
      count: sightings.length,
      sightings
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sightings",
      error: error.message
    });
  }
};


// ==========================================
// GET PENDING SIGHTINGS
// ADMIN
// ==========================================

const getPendingSightings = async (req, res) => {
  try {

    const sightings = await Sighting.find({
      verificationStatus: "pending"
    })
      .populate(
        "species",
        "commonName scientificName conservationStatus"
      )
      .populate(
        "reportedBy",
        "name email role"
      )
      .sort({ createdAt: -1 });


    res.status(200).json({
      count: sightings.length,
      sightings
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending sightings",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE SIGHTING
// ==========================================

const getSightingById = async (req, res) => {
  try {

    const sighting = await Sighting.findById(
      req.params.id
    )
      .populate(
        "species",
        "commonName scientificName conservationStatus"
      )
      .populate(
        "reportedBy",
        "name email role"
      )
      .populate(
        "verifiedBy",
        "name email role"
      );


    if (!sighting) {
      return res.status(404).json({
        message: "Sighting not found"
      });
    }
    res.status(200).json(sighting);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sighting",
      error: error.message
    });
  }
};


// ==========================================
// VERIFY / REJECT SIGHTING
// ADMIN
// ==========================================

const verifySighting = async (req, res) => {
  try {

    const sighting = await Sighting.findById(
      req.params.id
    );


    if (!sighting) {
      return res.status(404).json({
        message: "Sighting not found"
      });
    }


    const {
      verificationStatus,
      adminRemarks
    } = req.body;


    if (
      !["verified", "rejected"].includes(
        verificationStatus
      )
    ) {
      return res.status(400).json({
        message:
          "Verification status must be verified or rejected"
      });
    }


    sighting.verificationStatus =
      verificationStatus;

    sighting.adminRemarks =
      adminRemarks || "";

    sighting.verifiedBy =
      req.user._id;

    sighting.verifiedAt =
      new Date();


    await sighting.save();


    const updatedSighting =
      await Sighting.findById(
        sighting._id
      )
        .populate(
          "species",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "reportedBy",
          "name email role"
        )
        .populate(
          "verifiedBy",
          "name email role"
        );


    res.status(200).json({
      message:
        `Sighting ${verificationStatus} successfully`,
      sighting: updatedSighting
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to verify sighting",
      error: error.message
    });
  }
};


// ==========================================
// DELETE OWN PENDING SIGHTING
// ==========================================

const deleteMySighting = async (req, res) => {
  try {

    const sighting = await Sighting.findById(
      req.params.id
    );


    if (!sighting) {
      return res.status(404).json({
        message: "Sighting not found"
      });
    }


    if (
      sighting.reportedBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can delete only your own sighting"
      });
    }


    if (
      sighting.verificationStatus !==
      "pending"
    ) {
      return res.status(400).json({
        message:
          "Only pending sightings can be deleted"
      });
    }


    await Sighting.findByIdAndDelete(
      req.params.id
    );


    res.status(200).json({
      message:
        "Sighting deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to delete sighting",
      error: error.message
    });
  }
};


module.exports = {
  uploadSightingPhoto,
  createSighting,
  getMySightings,
  getAllSightings,
  getPendingSightings,
  getSightingById,
  verifySighting,
  deleteMySighting
};