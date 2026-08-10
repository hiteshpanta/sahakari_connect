const express = require("express");

const router = express.Router();

const {
  applyForCooperative,
  getMyApplications,
  getCooperativeKycRequests,
  approveCooperativeKyc,
  rejectCooperativeKyc,
  insufficientKyc
} = require("../controllers/cooperativeKycController");

const { protect } = require("../middleware/authMiddleware");

// Member applies for cooperative membership (requires login)
router.post("/apply", protect, applyForCooperative);

// Member checks their own applications
router.get("/my", protect, getMyApplications);

// Manager/Admin view requests for a specific cooperative
router.get("/:cooperativeId", protect, getCooperativeKycRequests);

// Approve
router.patch("/approve/:id", protect, approveCooperativeKyc);

// Reject
router.patch("/reject/:id", protect, rejectCooperativeKyc);

// Need more documents
router.patch("/insufficient/:id", protect, insufficientKyc);

module.exports = router;
