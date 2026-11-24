const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
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
} = require("../controllers/projectController");

const router = express.Router();


// CREATE PROJECT - ADMIN
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createProject
);


// GET ALL PROJECTS
router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "field_officer",
    "researcher",
    "public_user"
  ),
  getProjects
);


// FIELD OFFICER PROJECTS
router.get(
  "/my/field-officer",
  protect,
  authorizeRoles("field_officer"),
  getMyFieldOfficerProjects
);


// RESEARCHER PROJECTS
router.get(
  "/my/researcher",
  protect,
  authorizeRoles("researcher"),
  getMyResearcherProjects
);


// UPDATE PROJECT STATUS - ADMIN
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  updateProjectStatus
);


// UPDATE PROJECT PROGRESS
router.patch(
  "/:id/progress",
  protect,
  authorizeRoles(
    "admin",
    "field_officer",
    "researcher"
  ),
  updateProjectProgress
);


// ASSIGN TEAM - ADMIN
router.patch(
  "/:id/team",
  protect,
  authorizeRoles("admin"),
  assignTeamMembers
);


// UPDATE PROJECT - ADMIN
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateProject
);


// DELETE PROJECT - ADMIN
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteProject
);


// GET SINGLE PROJECT
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "field_officer",
    "researcher",
    "public_user"
  ),
  getProjectById
);


module.exports = router;