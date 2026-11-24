const express = require("express");
const upload = require("../middleware/uploadMiddleware");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createSpecies,
  getSpecies,
  getSpeciesById,
  updateSpecies,
  deleteSpecies,
  changeSpeciesStatus
} = require("../controllers/speciesController");

const { uploadSpeciesImage } = require("../controllers/speciesController");

const router = express.Router();

router.post(
  "/upload-image",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  uploadSpeciesImage
);


// ==========================================
// ADMIN - CREATE
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createSpecies
);


// ==========================================
// ALL AUTHENTICATED USERS - VIEW
// ==========================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "field_officer",
    "researcher",
    "public_user"
  ),
  getSpecies
);


// ==========================================
// ADMIN - CHANGE STATUS
// ==========================================

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  changeSpeciesStatus
);


// ==========================================
// ADMIN - UPDATE
// ==========================================

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateSpecies
);


// ==========================================
// ADMIN - DELETE
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteSpecies
);


// ==========================================
// ALL AUTHENTICATED USERS - VIEW DETAILS
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
  getSpeciesById
);


module.exports = router;