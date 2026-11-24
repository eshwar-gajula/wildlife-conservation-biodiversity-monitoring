const Incident = require("../models/Incident");
const User = require("../models/User");
const ConservationProject = require("../models/ConservationProject");

// CREATE INCIDENT
const createIncident = async (req, res) => {
  try {
    const {
      incidentType,
      project,
      title,
      description,
      location,
      coordinates,
      severity,
      photos
    } = req.body;

    if (
      !incidentType ||
      !title ||
      !description ||
      !location ||
      !coordinates
    ) {
      return res.status(400).json({
        message:
          "Incident type, title, description, location and coordinates are required"
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

    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return res.status(400).json({
        message:
          "Coordinates must contain longitude and latitude"
      });
    }

    const incident = await Incident.create({
      reportedBy: req.user._id,
      project: project || null,
      reporterRole: req.user.role,
      incidentType,
      title,
      description,
      location,
      coordinates: {
        type: "Point",
        coordinates
      },
      severity: severity || "medium",
      photos: photos || [],
      status: "pending"
    });

    const populatedIncident =
      await Incident.findById(incident._id)
        .populate(
          "reportedBy",
          "name email role"
        )
        .populate(
          "assignedOfficer",
          "name email phone role"
        );

    res.status(201).json({
      message: "Incident reported successfully",
      incident: populatedIncident
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to report incident",
      error: error.message
    });
  }
};


// GET MY INCIDENTS
const getMyIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      reportedBy: req.user._id
    })
      .populate(
        "assignedOfficer",
        "name email phone role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: incidents.length,
      incidents
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your incidents",
      error: error.message
    });
  }
};


// GET ALL INCIDENTS - ADMIN
const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .populate(
        "reportedBy",
        "name email role"
      )
      .populate(
        "assignedOfficer",
        "name email phone role"
      )
      .populate(
        "confirmedBy",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: incidents.length,
      incidents
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch incidents",
      error: error.message
    });
  }
};


// GET PENDING INCIDENTS - ADMIN
const getPendingIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      status: "pending"
    })
      .populate(
        "reportedBy",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: incidents.length,
      incidents
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch pending incidents",
      error: error.message
    });
  }
};


// GET MY ASSIGNED INCIDENTS - FIELD OFFICER
const getAssignedIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({
      assignedOfficer: req.user._id
    })
      .populate(
        "reportedBy",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: incidents.length,
      incidents
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch assigned incidents",
      error: error.message
    });
  }
};


// GET SINGLE INCIDENT
const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(
      req.params.id
    )
      .populate(
        "reportedBy",
        "name email role"
      )
      .populate(
        "assignedOfficer",
        "name email phone role"
      )
      .populate(
        "confirmedBy",
        "name email role"
      );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found"
      });
    }

    // Field officer can only see assigned incident
    if (
      req.user.role === "field_officer" &&
      incident.assignedOfficer &&
      incident.assignedOfficer._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    // Public user can only see own incident
    if (
      req.user.role === "public_user" &&
      incident.reportedBy._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json(incident);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch incident",
      error: error.message
    });
  }
};


// CONFIRM / REJECT INCIDENT - ADMIN
const reviewIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(
      req.params.id
    );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found"
      });
    }

    if (incident.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending incidents can be reviewed"
      });
    }

    const {
      status,
      adminRemarks
    } = req.body;

    if (
      !["confirmed", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Status must be confirmed or rejected"
      });
    }

    incident.status = status;
    incident.adminRemarks =
      adminRemarks || "";

    if (status === "confirmed") {
      incident.confirmedBy =
        req.user._id;

      incident.confirmedAt =
        new Date();
    }

    await incident.save();

    const updatedIncident =
      await Incident.findById(
        incident._id
      )
        .populate(
          "reportedBy",
          "name email role"
        )
        .populate(
          "assignedOfficer",
          "name email phone role"
        )
        .populate(
          "confirmedBy",
          "name email role"
        );

    res.status(200).json({
      message:
        `Incident ${status} successfully`,
      incident: updatedIncident
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to review incident",
      error: error.message
    });
  }
};


// ASSIGN INCIDENT TO FIELD OFFICER
const assignIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(
      req.params.id
    );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found"
      });
    }

    if (incident.status !== "confirmed") {
      return res.status(400).json({
        message:
          "Only confirmed incidents can be assigned"
      });
    }

    const { officerId } = req.body;

    if (!officerId) {
      return res.status(400).json({
        message:
          "Field Officer ID is required"
      });
    }

    const officer = await User.findOne({
      _id: officerId,
      role: "field_officer",
      status: "active"
    });

    if (!officer) {
      return res.status(404).json({
        message:
          "Active Field Officer not found"
      });
    }

    incident.assignedOfficer =
      officer._id;

    incident.status = "in_progress";

    await incident.save();

    const updatedIncident =
      await Incident.findById(
        incident._id
      )
        .populate(
          "reportedBy",
          "name email role"
        )
        .populate(
          "assignedOfficer",
          "name email phone role"
        );

    res.status(200).json({
      message:
        "Incident assigned successfully",
      incident: updatedIncident
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to assign incident",
      error: error.message
    });
  }
};


// UPDATE INCIDENT STATUS - FIELD OFFICER
const updateIncidentStatus = async (
  req,
  res
) => {
  try {
    const incident = await Incident.findById(
      req.params.id
    );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found"
      });
    }

    if (
      !incident.assignedOfficer ||
      incident.assignedOfficer.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "This incident is not assigned to you"
      });
    }

    const { status } = req.body;

    if (
      !["in_progress", "resolved"].includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Status must be in_progress or resolved"
      });
    }

    incident.status = status;

    if (status === "resolved") {
      incident.resolvedAt =
        new Date();
    }

    await incident.save();

    res.status(200).json({
      message:
        `Incident marked as ${status}`,
      incident
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update incident",
      error: error.message
    });
  }
};


// CLOSE INCIDENT - ADMIN
const closeIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(
      req.params.id
    );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found"
      });
    }

    if (incident.status !== "resolved") {
      return res.status(400).json({
        message:
          "Only resolved incidents can be closed"
      });
    }

    incident.status = "closed";
    incident.closedAt = new Date();

    await incident.save();

    res.status(200).json({
      message:
        "Incident closed successfully",
      incident
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to close incident",
      error: error.message
    });
  }
};


// DELETE MY PENDING INCIDENT
const deleteMyIncident = async (
  req,
  res
) => {
  try {
    const incident = await Incident.findById(
      req.params.id
    );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found"
      });
    }

    if (
      incident.reportedBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can delete only your own incident"
      });
    }

    if (incident.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending incidents can be deleted"
      });
    }

    await Incident.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message:
        "Incident deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to delete incident",
      error: error.message
    });
  }
};


module.exports = {
  createIncident,
  getMyIncidents,
  getAllIncidents,
  getPendingIncidents,
  getAssignedIncidents,
  getIncidentById,
  reviewIncident,
  assignIncident,
  updateIncidentStatus,
  closeIncident,
  deleteMyIncident
};