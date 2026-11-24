const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createFieldOfficer,
  createResearcher,
  getFieldOfficers,
  getResearchers,
  getUserById,
  updateUser,
  changeUserStatus,
  deleteUser
} = require("../controllers/userController");

const router = express.Router();


// =====================================
// FIELD OFFICERS
// =====================================

router.post(
  "/field-officers",
  protect,
  authorizeRoles("admin"),
  createFieldOfficer
);

router.get(
  "/field-officers",
  protect,
  authorizeRoles("admin"),
  getFieldOfficers
);


// =====================================
// RESEARCHERS
// =====================================

router.post(
  "/researchers",
  protect,
  authorizeRoles("admin"),
  createResearcher
);

router.get(
  "/researchers",
  protect,
  authorizeRoles("admin"),
  getResearchers
);


// =====================================
// COMMON USER OPERATIONS
// =====================================

router.get(
  "/:id",
  protect,
  authorizeRoles("admin"),
  getUserById
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateUser
);

router.patch(
  "/:id/status",
  protect,
  authorizeRoles("admin"),
  changeUserStatus
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteUser
);


module.exports = router;