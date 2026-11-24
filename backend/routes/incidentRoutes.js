const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
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
} = require("../controllers/incidentController");

const router = express.Router();


// REPORT INCIDENT
router.post(
  "/",
  protect,
  authorizeRoles(
    "field_officer",
    "public_user"
  ),
  createIncident
);


// MY INCIDENTS
router.get(
  "/my",
  protect,
  authorizeRoles(
    "field_officer",
    "public_user"
  ),
  getMyIncidents
);
// PENDING INCIDENTS - ADMIN
router.get(
  "/pending",
  protect,
  authorizeRoles("admin"),
  getPendingIncidents
);


// ASSIGNED INCIDENTS - FIELD OFFICER
router.get(
  "/assigned",
  protect,
  authorizeRoles("field_officer"),
  getAssignedIncidents
);


// ALL INCIDENTS - ADMIN
router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllIncidents
);


// REVIEW INCIDENT
router.patch(
  "/:id/review",
  protect,
  authorizeRoles("admin"),
  reviewIncident
);


// ASSIGN INCIDENT
router.patch(
  "/:id/assign",
  protect,
  authorizeRoles("admin"),
  assignIncident
);


// UPDATE INCIDENT STATUS
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("field_officer"),
  updateIncidentStatus
);


// CLOSE INCIDENT
router.patch(
  "/:id/close",
  protect,
  authorizeRoles("admin"),
  closeIncident
);


// DELETE OWN PENDING INCIDENT
router.delete(
  "/:id",
  protect,
  authorizeRoles(
    "field_officer",
    "public_user"
  ),
  deleteMyIncident
);


// GET SINGLE INCIDENT
router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "field_officer",
    "public_user"
  ),
  getIncidentById
);


module.exports = router;