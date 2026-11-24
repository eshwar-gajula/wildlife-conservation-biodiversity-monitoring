// const express = require("express");

// const protect = require("../middleware/authMiddleware");
// const authorizeRoles = require("../middleware/roleMiddleware");
// const upload = require("../middleware/uploadMiddleware");

// const {
//   uploadResearchAttachment,
//   createResearchObservation,
//   getMyResearchObservations,
//   getAllResearchObservations,
//   getResearchObservationById,
//   reviewResearchObservation,
//   updateResearchObservation,
//   deleteResearchObservation
// } = require("../controllers/researchController");

// const router = express.Router();

// const uploadResearchFile = (req, res, next) => {
//   upload.single("file")(req, res, (error) => {
//     if (error) {
//       return res.status(400).json({
//         message: error.message || "Could not upload the research photo"
//       });
//     }

//     next();
//   });
// };

// // RESEARCH ATTACHMENTS
// router.post(
//   "/attachments",
//   protect,
//   authorizeRoles("researcher"),
//   uploadResearchFile,
//   uploadResearchAttachment
// );

// // CREATE RESEARCH
// router.post(
//   "/",
//   protect,
//   authorizeRoles("researcher"),
//   createResearchObservation
// );


// // MY RESEARCH
// router.get(
//   "/my",
//   protect,
//   authorizeRoles("researcher"),
//   getMyResearchObservations
// );


// // ALL RESEARCH
// router.get(
//   "/",
//   protect,
//   authorizeRoles(
//     "admin",
//     "researcher"
//   ),
//   getAllResearchObservations
// );


// // ADMIN REVIEW
// router.patch(
//   "/:id/review",
//   protect,
//   authorizeRoles("admin"),
//   reviewResearchObservation
// );


// // UPDATE RESEARCH
// router.put(
//   "/:id",
//   protect,
//   authorizeRoles("researcher"),
//   updateResearchObservation
// );


// // DELETE RESEARCH
// router.delete(
//   "/:id",
//   protect,
//   authorizeRoles("researcher"),
//   deleteResearchObservation
// );


// // SINGLE RESEARCH
// router.get(
//   "/:id",
//   protect,
//   authorizeRoles(
//     "admin",
//     "researcher"
//   ),
//   getResearchObservationById
// );

// module.exports = router;
const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadResearchAttachment,
  createResearchObservation,
  getMyResearchObservations,
  getAllResearchObservations,
  getResearchObservationById,
  reviewResearchObservation,
  updateResearchObservation,
  deleteResearchObservation,
  downloadResearchReportPdf
} = require("../controllers/researchController");

const router = express.Router();


// ======================================================
// RESEARCH FILE UPLOAD MIDDLEWARE
// ======================================================

const uploadResearchFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message:
          error.message || "Could not upload the research photo"
      });
    }

    next();
  });
};


// ======================================================
// RESEARCH ATTACHMENTS
// Researcher uploads research image/file
// ======================================================

router.post(
  "/attachments",
  protect,
  authorizeRoles("researcher"),
  uploadResearchFile,
  uploadResearchAttachment
);


// ======================================================
// CREATE RESEARCH OBSERVATION
// Researcher creates research
// ======================================================

router.post(
  "/",
  protect,
  authorizeRoles("researcher"),
  createResearchObservation
);


// ======================================================
// GET MY RESEARCH
// Researcher can see only their own research
// ======================================================

router.get(
  "/my",
  protect,
  authorizeRoles("researcher"),
  getMyResearchObservations
);


// ======================================================
// GET ALL RESEARCH
// Admin + Researcher
// ======================================================

router.get(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "researcher"
  ),
  getAllResearchObservations
);


// ======================================================
// ADMIN REVIEW RESEARCH
// Admin approves or rejects research
// ======================================================

router.patch(
  "/:id/review",
  protect,
  authorizeRoles("admin"),
  reviewResearchObservation
);


// ======================================================
// UPDATE RESEARCH
// Researcher can update own research
// ======================================================

router.put(
  "/:id",
  protect,
  authorizeRoles("researcher"),
  updateResearchObservation
);


// ======================================================
// DELETE RESEARCH
// Researcher can delete own research
// ======================================================

router.delete(
  "/:id",
  protect,
  authorizeRoles("researcher"),
  deleteResearchObservation
);


// ======================================================
// DOWNLOAD RESEARCH REPORT AS PDF
//
// Researcher -> can download own report
// Admin      -> can download any report
// ======================================================

router.get(
  "/:id/pdf",
  protect,
  authorizeRoles(
    "admin",
    "researcher"
  ),
  downloadResearchReportPdf
);


// ======================================================
// GET SINGLE RESEARCH
//
// Admin      -> any research
// Researcher -> own research only
// ======================================================

router.get(
  "/:id",
  protect,
  authorizeRoles(
    "admin",
    "researcher"
  ),
  getResearchObservationById
);


module.exports = router;