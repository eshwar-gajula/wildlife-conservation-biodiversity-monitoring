const Species = require("../models/Species");

const uploadSpeciesImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "An image file is required"
    });
  }

  res.status(201).json({
    message: "Species image uploaded successfully",
    url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
  });
};

// ==========================================
// CREATE SPECIES
// ==========================================

const createSpecies = async (req, res) => {
  try {
    const {
      commonName,
      scientificName,
      family,
      description,
      conservationStatus,
      population,
      diet,
      behavior,
      physicalDescription,
      habitat,
      distribution,
      threats,
      images
    } = req.body;

    if (!commonName || !scientificName) {
      return res.status(400).json({
        message: "Common name and scientific name are required"
      });
    }

    const existingSpecies = await Species.findOne({
      scientificName
    });

    if (existingSpecies) {
      return res.status(409).json({
        message: "Species with this scientific name already exists"
      });
    }

    const species = await Species.create({
      commonName,
      scientificName,
      family,
      description,
      conservationStatus,
      population,
      diet,
      behavior,
      physicalDescription,
      habitat,
      distribution,
      threats,
      images: images || [],
      status: "active",
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Species created successfully",
      species
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create species",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL SPECIES
// ==========================================

const getSpecies = async (req, res) => {
  try {
    const species = await Species.find({
      status: "active"
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: species.length,
      species
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch species",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE SPECIES
// ==========================================

const getSpeciesById = async (req, res) => {
  try {
    const species = await Species.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!species) {
      return res.status(404).json({
        message: "Species not found"
      });
    }

    res.status(200).json(species);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch species",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE SPECIES
// ==========================================

const updateSpecies = async (req, res) => {
  try {
    const species = await Species.findById(req.params.id);

    if (!species) {
      return res.status(404).json({
        message: "Species not found"
      });
    }

    const {
      commonName,
      scientificName,
      family,
      description,
      conservationStatus,
      population,
      diet,
      behavior,
      physicalDescription,
      habitat,
      distribution,
      threats,
      images
    } = req.body;

    // Check duplicate scientific name
    if (
      scientificName &&
      scientificName !== species.scientificName
    ) {
      const existingSpecies = await Species.findOne({
        scientificName,
        _id: { $ne: req.params.id }
      });

      if (existingSpecies) {
        return res.status(409).json({
          message: "Another species already uses this scientific name"
        });
      }
    }

    species.commonName =
      commonName || species.commonName;

    species.scientificName =
      scientificName || species.scientificName;

    species.family =
      family || species.family;

    species.description =
      description || species.description;

    species.conservationStatus =
      conservationStatus || species.conservationStatus;

    species.population =
      population !== undefined
        ? population
        : species.population;

    species.diet =
      diet || species.diet;

    species.behavior =
      behavior || species.behavior;

    species.physicalDescription =
      physicalDescription || species.physicalDescription;

    species.habitat =
      habitat || species.habitat;

    species.distribution =
      distribution || species.distribution;

    species.threats =
      threats || species.threats;

    species.images =
      images || species.images;

    await species.save();

    res.status(200).json({
      message: "Species updated successfully",
      species
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update species",
      error: error.message
    });
  }
};


// ==========================================
// DELETE SPECIES
// ==========================================

const deleteSpecies = async (req, res) => {
  try {
    const species = await Species.findById(req.params.id);

    if (!species) {
      return res.status(404).json({
        message: "Species not found"
      });
    }

    await Species.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Species deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete species",
      error: error.message
    });
  }
};


// ==========================================
// CHANGE SPECIES STATUS
// ==========================================

const changeSpeciesStatus = async (req, res) => {
  try {
    const species = await Species.findById(req.params.id);

    if (!species) {
      return res.status(404).json({
        message: "Species not found"
      });
    }

    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or inactive"
      });
    }

    species.status = status;

    await species.save();

    res.status(200).json({
      message: `Species ${status} successfully`,
      status: species.status
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change species status",
      error: error.message
    });
  }
};


module.exports = {
  uploadSpeciesImage,
  createSpecies,
  getSpecies,
  getSpeciesById,
  updateSpecies,
  deleteSpecies,
  changeSpeciesStatus
};