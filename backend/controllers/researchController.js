const ResearchObservation = require("../models/ResearchObservation");
const Species = require("../models/Species");
const Habitat = require("../models/Habitat");
const ConservationProject = require("../models/ConservationProject");
const PDFDocument = require("pdfkit");
// UPLOAD RESEARCH ATTACHMENT
const uploadResearchAttachment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "An image file is required"
    });
  }

  res.status(201).json({
    message: "Research attachment uploaded successfully",
    url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
  });
};

// CREATE RESEARCH OBSERVATION
const createResearchObservation = async (req, res) => {
  try {
    const {
      title,
      project,
      species,
      habitats,
      observationDate,
      location,
      coordinates,
      methodology,
      observation,
      findings,
      conclusion,
      recommendations,
      attachments,
      status
    } = req.body;

    if (
      !title ||
      !observationDate ||
      !location ||
      !observation
    ) {
      return res.status(400).json({
        message:
          "Title, observation date, location and observation are required"
      });
    }

    if (project) {
      const assignedProject = await ConservationProject.findOne({
        _id: project,
        assignedResearchers: req.user._id
      });
      if (!assignedProject) {
        return res.status(403).json({ message: "You are not assigned to this project" });
      }
    }

    if (status !== undefined && !["draft", "pending", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be draft, pending, or completed"
      });
    }

    // Validate species IDs
    if (species && species.length > 0) {
      const speciesCount = await Species.countDocuments({
        _id: { $in: species },
        status: "active"
      });

      if (speciesCount !== species.length) {
        return res.status(400).json({
          message:
            "One or more species are invalid"
        });
      }
    }

    // Validate habitat IDs
    if (habitats && habitats.length > 0) {
      const habitatCount = await Habitat.countDocuments({
        _id: { $in: habitats },
        status: "active"
      });

      if (habitatCount !== habitats.length) {
        return res.status(400).json({
          message:
            "One or more habitats are invalid"
        });
      }
    }

    const research =
      await ResearchObservation.create({
        title,
        researcher: req.user._id,
        project: project || null,
        species: species || [],
        habitats: habitats || [],
        observationDate,
        location,
        coordinates: coordinates || [],
        methodology,
        observation,
        findings,
        conclusion,
        recommendations,
        attachments: attachments || [],
        status: status === "completed" ? "pending" : (status || "draft")
      });

    res.status(201).json({
      message:
        "Research observation created successfully",
      research
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to create research observation",
      error: error.message
    });
  }
};


// GET MY RESEARCH OBSERVATIONS
const getMyResearchObservations = async (
  req,
  res
) => {
  try {
    const research =
      await ResearchObservation.find({
        researcher: req.user._id
      })
        .populate(
          "species",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "habitats",
          "name habitatType location"
        )
        .populate("project", "projectName status objective progress")
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: research.length,
      research
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch research observations",
      error: error.message
    });
  }
};


// GET ALL RESEARCH OBSERVATIONS
const getAllResearchObservations = async (
  req,
  res
) => {
  try {
    const research =
      await ResearchObservation.find()
        .populate(
          "researcher",
          "name email"
        )
        .populate(
          "species",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "habitats",
          "name habitatType location"
        )
        .populate("project", "projectName status objective progress")
        .sort({ createdAt: -1 });

    res.status(200).json({
      count: research.length,
      research
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch research observations",
      error: error.message
    });
  }
};


// GET SINGLE RESEARCH OBSERVATION
const getResearchObservationById = async (
  req,
  res
) => {
  try {
    const research =
      await ResearchObservation.findById(
        req.params.id
      )
        .populate(
          "researcher",
          "name email role"
        )
        .populate(
          "species",
          "commonName scientificName conservationStatus"
        )
        .populate(
          "habitats",
          "name habitatType location"
        );

    if (!research) {
      return res.status(404).json({
        message:
          "Research observation not found"
      });
    }

    // Researcher can only view own research
    if (
      req.user.role === "researcher" &&
      String(research.researcher._id) !==
        String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    res.status(200).json({
      research
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to fetch research observation",
      error: error.message
    });
  }
};


// ADMIN REVIEW RESEARCH OBSERVATION
const reviewResearchObservation = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Research status must be approved or rejected"
      });
    }

    const research = await ResearchObservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("researcher", "name email")
      .populate("species", "commonName scientificName conservationStatus")
      .populate("habitats", "name habitatType location");

    if (!research) {
      return res.status(404).json({ message: "Research observation not found" });
    }

    // Keep the related project in sync with approved researcher work.
    if (status === "approved" && research.project) {
      const project = await ConservationProject.findById(research.project);

      if (project) {
        const approvedResearcherIds = await ResearchObservation.distinct(
          "researcher",
          { project: project._id, status: "approved" }
        );
        const allAssignedResearchersCompleted =
          project.assignedResearchers.length > 0 &&
          project.assignedResearchers.every((researcherId) =>
            approvedResearcherIds.some(
              (approvedId) => approvedId.toString() === researcherId.toString()
            )
          );

        project.progress = allAssignedResearchersCompleted
          ? 100
          : Math.max(project.progress, 1);
        project.status = allAssignedResearchersCompleted
          ? "completed"
          : "active";
        await project.save();
      }
    }

    res.status(200).json({
      message: `Research observation ${status} successfully`,
      research
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to review research observation",
      error: error.message
    });
  }
};


// UPDATE RESEARCH OBSERVATION
const updateResearchObservation = async (
  req,
  res
) => {
  try {
    const research =
      await ResearchObservation.findOne({
        _id: req.params.id,
        researcher: req.user._id
      });

    if (!research) {
      return res.status(404).json({
        message:
          "Research observation not found"
      });
    }

    const {
      title,
      species,
      habitats,
      observationDate,
      location,
      coordinates,
      methodology,
      observation,
      findings,
      conclusion,
      recommendations,
      attachments,
      status
    } = req.body;

    if (title !== undefined) {
      research.title = title;
    }

    if (species !== undefined) {
      research.species = species;
    }

    if (habitats !== undefined) {
      research.habitats = habitats;
    }

    if (observationDate !== undefined) {
      research.observationDate =
        observationDate;
    }

    if (location !== undefined) {
      research.location = location;
    }

    if (coordinates !== undefined) {
      research.coordinates = coordinates;
    }

    if (methodology !== undefined) {
      research.methodology = methodology;
    }

    if (observation !== undefined) {
      research.observation = observation;
    }

    if (findings !== undefined) {
      research.findings = findings;
    }

    if (conclusion !== undefined) {
      research.conclusion = conclusion;
    }

    if (recommendations !== undefined) {
      research.recommendations =
        recommendations;
    }

    if (attachments !== undefined) {
      research.attachments = attachments;
    }

    if (status !== undefined) {
      if (
        !["draft", "pending", "completed"].includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid research status"
        });
      }

      research.status = status === "completed" ? "pending" : status;
    }

    await research.save();

    res.status(200).json({
      message:
        "Research observation updated successfully",
      research
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to update research observation",
      error: error.message
    });
  }
};


// DELETE RESEARCH OBSERVATION
const deleteResearchObservation = async (
  req,
  res
) => {
  try {
    const research =
      await ResearchObservation.findOne({
        _id: req.params.id,
        researcher: req.user._id
      });

    if (!research) {
      return res.status(404).json({
        message:
          "Research observation not found"
      });
    }

    await research.deleteOne();

    res.status(200).json({
      message:
        "Research observation deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message:
        "Failed to delete research observation",
      error: error.message
    });
  }
};



// ==========================================
// DOWNLOAD RESEARCH REPORT AS PDF
// Researcher (own report) or Admin (any report)
// ==========================================

const downloadResearchReportPdf = async (req, res) => {
  try {
    const report = await ResearchObservation.findById(req.params.id)
      .populate("researcher", "name email role")
      .populate("project", "projectName location objective")
      .populate("species", "commonName scientificName")
      .populate("habitats", "name habitatType location");

    if (!report) {
      return res.status(404).json({
        message: "Research report not found"
      });
    }

    const isOwner = report.researcher?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to download this report"
      });
    }

    const safeTitle = (report.title || "research-report")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(20).fillColor("#176b4f").text("Wildlife Research Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#000000").text(report.title, { align: "center" });
    doc.moveDown(1.5);

    const addRow = (label, value) => {
      doc.fontSize(11).fillColor("#176b4f").text(label, { continued: true });
      doc.fillColor("#000000").text(`  ${value || "Not specified"}`);
      doc.moveDown(0.3);
    };

    addRow("Researcher:", report.researcher?.name);
    addRow("Email:", report.researcher?.email);
    addRow("Project:", report.project?.projectName);
    addRow("Status:", report.status);
    addRow(
      "Observation date:",
      report.observationDate ? new Date(report.observationDate).toLocaleDateString() : ""
    );
    addRow("Location:", report.location);

    if (report.coordinates?.length === 2) {
      addRow(
        "Coordinates:",
        `${report.coordinates[1].toFixed(5)}, ${report.coordinates[0].toFixed(5)}`
      );
    }

    addRow("Species:", report.species?.map((item) => item.commonName).join(", "));
    addRow("Habitats:", report.habitats?.map((item) => item.name).join(", "));

    doc.moveDown();

    const addSection = (heading, text) => {
      if (!text) return;
      doc.fontSize(13).fillColor("#176b4f").text(heading);
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#000000").text(text, { align: "justify" });
      doc.moveDown();
    };

    addSection("Methodology", report.methodology);
    addSection("Observation", report.observation);
    addSection("Findings", report.findings);
    addSection("Conclusion", report.conclusion);
    addSection("Recommendations", report.recommendations);

    doc.moveDown();
    doc.fontSize(9).fillColor("#888888").text(`Generated on ${new Date().toLocaleString()}`, {
      align: "right"
    });

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate PDF",
      error: error.message
    });
  }
};



module.exports = {
  uploadResearchAttachment,
  createResearchObservation,
  getMyResearchObservations,
  getAllResearchObservations,
  getResearchObservationById,
  reviewResearchObservation,
  updateResearchObservation,
  deleteResearchObservation,
   downloadResearchReportPdf
};
