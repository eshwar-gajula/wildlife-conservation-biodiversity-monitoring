const ConservationProject = require("../models/ConservationProject");
const User = require("../models/User");
const Species = require("../models/Species");
const Habitat = require("../models/Habitat");


// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const {
      projectName,
      objective,
      description,
      targetSpecies,
      targetHabitats,
      activities,
      location,
      budget,
      startDate,
      endDate,
      images,
      adminRemarks,
      assignedFieldOfficers,
      assignedResearchers
    } = req.body;

    if (
      !projectName ||
      !objective ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        message:
          "Project name, objective, start date and end date are required"
      });
    }

    if (
      new Date(endDate) < new Date(startDate)
    ) {
      return res.status(400).json({
        message:
          "End date cannot be before start date"
      });
    }

    const project = await ConservationProject.create({
      projectName,
      objective,
      description,
      targetSpecies: targetSpecies || [],
      targetHabitats: targetHabitats || [],
      activities: Array.isArray(activities)
        ? activities
        : typeof activities === "string"
          ? activities.split("\n").map((item) => item.trim()).filter(Boolean)
          : [],
      location: location || "General operational area",
      budget: budget || 0,
      startDate,
      endDate,
      images: images || [],
      adminRemarks: adminRemarks || "",
      assignedFieldOfficers: assignedFieldOfficers || [],
      assignedResearchers: assignedResearchers || [],
      createdBy: req.user._id,
      status: "planned",
      progress: 0
    });

    const populatedProject =
      await ConservationProject.findById(
        project._id
      )
        .populate(
          "targetSpecies",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "targetHabitats",
          "name habitatType location"
        )
        .populate(
          "createdBy",
          "name email role"
        );

    res.status(201).json({
      message:
        "Conservation project created successfully",
      project: populatedProject
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to create conservation project",
      error: error.message
    });
  }
};


// GET ALL PROJECTS
const getProjects = async (req, res) => {
  try {
    const projects =
      await ConservationProject.find()
        .populate(
          "targetSpecies",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "targetHabitats",
          "name habitatType location"
        )
        .populate(
          "assignedFieldOfficers",
          "name email phone role"
        )
        .populate(
          "assignedResearchers",
          "name email phone role"
        )
        .populate(
          "createdBy",
          "name email role"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch conservation projects",
      error: error.message
    });
  }
};


// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
  try {
    const project =
      await ConservationProject.findById(
        req.params.id
      )
        .populate(
          "targetSpecies",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "targetHabitats",
          "name habitatType location"
        )
        .populate(
          "assignedFieldOfficers",
          "name email phone role"
        )
        .populate(
          "assignedResearchers",
          "name email phone role"
        )
        .populate(
          "createdBy",
          "name email role"
        );

    if (!project) {
      return res.status(404).json({
        message: "Conservation project not found"
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch conservation project",
      error: error.message
    });
  }
};


// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    const project =
      await ConservationProject.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        message: "Conservation project not found"
      });
    }

    const {
      projectName,
      objective,
      description,
      targetSpecies,
      targetHabitats,
      activities,
      location,
      budget,
      startDate,
      endDate,
      images,
      adminRemarks
    } = req.body;

    const newStartDate =
      startDate || project.startDate;

    const newEndDate =
      endDate || project.endDate;

    if (
      new Date(newEndDate) <
      new Date(newStartDate)
    ) {
      return res.status(400).json({
        message:
          "End date cannot be before start date"
      });
    }

    project.projectName =
      projectName || project.projectName;

    project.objective =
      objective || project.objective;

    project.description =
      description !== undefined
        ? description
        : project.description;

    project.targetSpecies =
      targetSpecies || project.targetSpecies;

    project.targetHabitats =
      targetHabitats || project.targetHabitats;

    project.activities =
      activities || project.activities;

    project.location =
      location || project.location;

    project.budget =
      budget !== undefined
        ? budget
        : project.budget;

    project.startDate =
      newStartDate;

    project.endDate =
      newEndDate;

    project.images =
      images || project.images;

    project.adminRemarks =
      adminRemarks !== undefined
        ? adminRemarks
        : project.adminRemarks;

    await project.save();

    res.status(200).json({
      message:
        "Conservation project updated successfully",
      project
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update conservation project",
      error: error.message
    });
  }
};


// UPDATE PROJECT STATUS
const updateProjectStatus = async (
  req,
  res
) => {
  try {
    const project =
      await ConservationProject.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        message: "Conservation project not found"
      });
    }

    const { status } = req.body;

    if (
      ![
        "planned",
        "active",
        "completed",
        "cancelled"
      ].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid project status"
      });
    }

    project.status = status;

    if (status === "active") {
      if (project.progress === 100) {
        project.progress = 0;
      }
    }

    if (status === "completed") {
      project.progress = 100;
    }

    await project.save();

    res.status(200).json({
      message:
        `Project status changed to ${status}`,
      project
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update project status",
      error: error.message
    });
  }
};


// UPDATE PROJECT PROGRESS
const updateProjectProgress = async (
  req,
  res
) => {
  try {
    const project =
      await ConservationProject.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        message: "Conservation project not found"
      });
    }

    const { progress } = req.body;

    if (
      progress === undefined ||
      progress < 0 ||
      progress > 100
    ) {
      return res.status(400).json({
        message:
          "Progress must be between 0 and 100"
      });
    }

    project.progress = progress;

    if (progress === 100) {
      project.status = "completed";
    } else if (progress > 0) {
      project.status = "active";
    }

    await project.save();

    res.status(200).json({
      message:
        "Project progress updated successfully",
      project
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update project progress",
      error: error.message
    });
  }
};


// ASSIGN TEAM MEMBERS
const assignTeamMembers = async (
  req,
  res
) => {
  try {
    const project =
      await ConservationProject.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        message: "Conservation project not found"
      });
    }

    const {
      fieldOfficerIds,
      researcherIds
    } = req.body;

    if (
      fieldOfficerIds !== undefined &&
      !Array.isArray(fieldOfficerIds)
    ) {
      return res.status(400).json({
        message:
          "fieldOfficerIds must be an array"
      });
    }

    if (
      researcherIds !== undefined &&
      !Array.isArray(researcherIds)
    ) {
      return res.status(400).json({
        message:
          "researcherIds must be an array"
      });
    }

    if (fieldOfficerIds !== undefined) {
      const officers =
        await User.find({
          _id: { $in: fieldOfficerIds },
          role: "field_officer",
          status: "active"
        }).select("_id");

      if (
        officers.length !==
        fieldOfficerIds.length
      ) {
        return res.status(400).json({
          message:
            "One or more Field Officers are invalid or inactive"
        });
      }

      project.assignedFieldOfficers =
        fieldOfficerIds;
    }

    if (researcherIds !== undefined) {
      const researchers =
        await User.find({
          _id: { $in: researcherIds },
          role: "researcher",
          status: "active"
        }).select("_id");

      if (
        researchers.length !==
        researcherIds.length
      ) {
        return res.status(400).json({
          message:
            "One or more Researchers are invalid or inactive"
        });
      }

      project.assignedResearchers =
        researcherIds;
    }

    await project.save();

    const updatedProject =
      await ConservationProject.findById(
        project._id
      )
        .populate(
          "assignedFieldOfficers",
          "name email phone role"
        )
        .populate(
          "assignedResearchers",
          "name email phone role"
        );

    res.status(200).json({
      message:
        "Project team assigned successfully",
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to assign project team",
      error: error.message
    });
  }
};


// DELETE PROJECT
const deleteProject = async (
  req,
  res
) => {
  try {
    const project =
      await ConservationProject.findById(
        req.params.id
      );

    if (!project) {
      return res.status(404).json({
        message: "Conservation project not found"
      });
    }

    await ConservationProject.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message:
        "Conservation project deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to delete conservation project",
      error: error.message
    });
  }
};


// GET MY PROJECTS - FIELD OFFICER
const getMyFieldOfficerProjects = async (
  req,
  res
) => {
  try {
    const projects =
      await ConservationProject.find({
        assignedFieldOfficers: req.user._id
      })
        .populate(
          "targetSpecies",
          "commonName scientificName"
        )
        .populate(
          "targetHabitats",
          "name habitatType location"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch assigned projects",
      error: error.message
    });
  }
};


// GET MY PROJECTS - RESEARCHER
const getMyResearcherProjects = async (
  req,
  res
) => {
  try {
    const projects =
      await ConservationProject.find({
        assignedResearchers: req.user._id
      })
        .populate(
          "targetSpecies",
          "commonName scientificName"
        )
        .populate(
          "targetHabitats",
          "name habitatType location"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch assigned projects",
      error: error.message
    });
  }
};


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  updateProjectStatus,
  updateProjectProgress,
  assignTeamMembers,
  deleteProject,
  getMyFieldOfficerProjects,
  getMyResearcherProjects
};