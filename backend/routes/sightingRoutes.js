const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createSighting,
  uploadSightingPhoto,
  getMySightings,
  getAllSightings,
  getPendingSightings,
  getSightingById,
  verifySighting,
  deleteMySighting
} = require("../controllers/sightingController");

const router = express.Router();

router.post(
  "/upload-photo",
  protect,
  authorizeRoles("field_officer"),
  upload.single("image"),
  uploadSightingPhoto
);


// ==========================================
// FIELD OFFICER / PUBLIC USER
// CREATE SIGHTING
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles(
    "field_officer",
    "public_user"
  ),
  createSighting
);


// ==========================================
// MY SIGHTINGS
// ==========================================

router.get(
  "/my",
  protect,
  authorizeRoles(
    "field_officer",
    "public_user"
  ),
  getMySightings
);


// ==========================================
// ADMIN - PENDING SIGHTINGS
// IMPORTANT: BEFORE /:id
// ==========================================

router.get(
  "/pending",
  protect,
  authorizeRoles("admin"),
  getPendingSightings
);


// ==========================================
// ADMIN - ALL SIGHTINGS
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles("admin"),
  getAllSightings
);


// ==========================================
// ADMIN - VERIFY / REJECT
// ==========================================

router.patch(
  "/:id/verify",
  protect,
  authorizeRoles("admin"),
  verifySighting
);


// ==========================================
// DELETE OWN PENDING SIGHTING
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles(
    "field_officer",
    "public_user"
  ),
  deleteMySighting
);


// ==========================================
// VIEW SINGLE SIGHTING
// ==========================================

router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "field_officer",
    "researcher",
    "public_user"
  ),
  getSightingById
);


module.exports = router;