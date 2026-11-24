const Habitat = require("../models/Habitat");

const uploadHabitatImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "An image file is required"
    });
  }

  res.status(201).json({
    message: "Habitat image uploaded successfully",
    url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
  });
};

// ==========================================
// CREATE HABITAT
// ==========================================

const createHabitat = async (req, res) => {
  try {
    const {
      name,
      habitatType,
      description,
      location,
      area,
      areaUnit,
      climate,
      associatedSpecies,
      associatedSpeciesNames,
      threats,
      images
    } = req.body;

    if (!name || !habitatType || !location) {
      return res.status(400).json({
        message: "Name, habitat type and location are required"
      });
    }

    const existingHabitat = await Habitat.findOne({
      name,
      location
    });

    if (existingHabitat) {
      return res.status(409).json({
        message: "Habitat already exists at this location"
      });
    }

    const habitat = await Habitat.create({
      name,
      habitatType,
      description,
      location,
      area,
      areaUnit,
      climate,
      associatedSpecies: associatedSpecies || [],
      associatedSpeciesNames: Array.isArray(associatedSpeciesNames)
        ? associatedSpeciesNames
        : typeof associatedSpeciesNames === "string"
          ? associatedSpeciesNames.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
      threats,
      images: images || [],
      status: "active",
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Habitat created successfully",
      habitat
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create habitat",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL HABITATS
// ==========================================

const getHabitats = async (req, res) => {
  try {
    const habitats = await Habitat.find({
      status: "active"
    })
      .populate(
        "associatedSpecies",
        "commonName scientificName conservationStatus"
      )
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: habitats.length,
      habitats
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch habitats",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE HABITAT
// ==========================================

const getHabitatById = async (req, res) => {
  try {
    const habitat = await Habitat.findById(req.params.id)
      .populate(
        "associatedSpecies",
        "commonName scientificName conservationStatus"
      )
      .populate("createdBy", "name email");

    if (!habitat) {
      return res.status(404).json({
        message: "Habitat not found"
      });
    }

    res.status(200).json(habitat);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch habitat",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE HABITAT
// ==========================================

const updateHabitat = async (req, res) => {
  try {
    const habitat = await Habitat.findById(req.params.id);

    if (!habitat) {
      return res.status(404).json({
        message: "Habitat not found"
      });
    }

    const {
      name,
      habitatType,
      description,
      location,
      area,
      areaUnit,
      climate,
      associatedSpecies,
      associatedSpeciesNames,
      threats,
      images
    } = req.body;

    habitat.name =
      name || habitat.name;

    habitat.habitatType =
      habitatType || habitat.habitatType;

    habitat.description =
      description || habitat.description;

    habitat.location =
      location || habitat.location;

    habitat.area =
      area !== undefined
        ? area
        : habitat.area;

    habitat.areaUnit =
      areaUnit || habitat.areaUnit;

    habitat.climate =
      climate || habitat.climate;

    habitat.associatedSpecies =
      associatedSpecies || habitat.associatedSpecies;

    habitat.associatedSpeciesNames =
      associatedSpeciesNames !== undefined
        ? (Array.isArray(associatedSpeciesNames)
          ? associatedSpeciesNames
          : typeof associatedSpeciesNames === "string"
            ? associatedSpeciesNames.split(",").map((item) => item.trim()).filter(Boolean)
            : habitat.associatedSpeciesNames)
        : habitat.associatedSpeciesNames;

    habitat.threats =
      threats || habitat.threats;

    habitat.images =
      images || habitat.images;

    await habitat.save();

    const updatedHabitat = await Habitat.findById(habitat._id)
      .populate(
        "associatedSpecies",
        "commonName scientificName conservationStatus"
      )
      .populate("createdBy", "name email");

    res.status(200).json({
      message: "Habitat updated successfully",
      habitat: updatedHabitat
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update habitat",
      error: error.message
    });
  }
};


// ==========================================
// CHANGE HABITAT STATUS
// ==========================================

const changeHabitatStatus = async (req, res) => {
  try {
    const habitat = await Habitat.findById(req.params.id);

    if (!habitat) {
      return res.status(404).json({
        message: "Habitat not found"
      });
    }

    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Status must be active or inactive"
      });
    }

    habitat.status = status;

    await habitat.save();

    res.status(200).json({
      message: `Habitat ${status} successfully`,
      status: habitat.status
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change habitat status",
      error: error.message
    });
  }
};


// ==========================================
// DELETE HABITAT
// ==========================================

const deleteHabitat = async (req, res) => {
  try {
    const habitat = await Habitat.findById(req.params.id);

    if (!habitat) {
      return res.status(404).json({
        message: "Habitat not found"
      });
    }

    await Habitat.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Habitat deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete habitat",
      error: error.message
    });
  }
};


module.exports = {
  uploadHabitatImage,
  createHabitat,
  getHabitats,
  getHabitatById,
  updateHabitat,
  changeHabitatStatus,
  deleteHabitat
};