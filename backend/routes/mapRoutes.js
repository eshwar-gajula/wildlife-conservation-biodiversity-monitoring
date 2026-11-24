const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getWildlifeMapData } = require("../controllers/mapController");

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("admin", "researcher", "field_officer", "public_user"),
  getWildlifeMapData
);

module.exports = router;