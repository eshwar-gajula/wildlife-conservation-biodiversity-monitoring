const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  createHabitat,
  getHabitats,
  getHabitatById,
  updateHabitat,
  changeHabitatStatus,
  deleteHabitat,
  uploadHabitatImage
} = require("../controllers/habitatController");

const router = express.Router();

router.post(
  "/upload-image",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  uploadHabitatImage
);


// ==========================================
// CREATE
// ==========================================

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createHabitat
);


// ==========================================
// VIEW ALL
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
  getHabitats
);


// ==========================================
// CHANGE STATUS
// ==========================================

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  changeHabitatStatus
);


// ==========================================
// UPDATE
// ==========================================

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateHabitat
);


// ==========================================
// DELETE
// ==========================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteHabitat
);


// ==========================================
// VIEW DETAILS
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
  getHabitatById
);


module.exports = router;