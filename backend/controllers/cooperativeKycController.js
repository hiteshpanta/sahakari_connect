const MembershipApplication = require("../models/CooperativeKyc");
const Cooperative = require("../models/Cooperative");
const User = require("../models/User");
const Customer = require("../models/Customer");
const { getOrCreateSavingsAccount } = require("../services/accountService");
const { emitToCooperative, emitToAdmins, emitToUser } = require("../services/socketService");

// ======================================
// MEMBER APPLY FOR COOPERATIVE
// ======================================

exports.applyForCooperative = async (req, res) => {
  try {
    const { cooperativeId, kycDocuments, applicant } = req.body;

    const userId = req.user._id;

    const cooperative = await Cooperative.findById(cooperativeId);

    if (!cooperative) {
      return res.status(404).json({ message: "Cooperative not found" });
    }

    if (cooperative.status !== "active") {
      return res.status(400).json({ message: "Cooperative is not available" });
    }

    // If the user is already an approved member, block duplicate applications
    if (req.user.cooperativeId && req.user.cooperativeId.toString() === cooperativeId) {
      return res.status(400).json({ message: "You are already a member of this cooperative" });
    }
    if ((req.user.cooperatives || []).some(id => id.toString() === cooperativeId)) {
      return res.status(400).json({ message: "You are already a member of this cooperative" });
    }

    let application = await MembershipApplication.findOne({
      user: userId,
      cooperative: cooperativeId
    });

    // Allow re-application if the previous one was rejected / marked insufficient
    if (application && application.status === "approved") {
      return res.status(400).json({ message: "You already applied for this cooperative" });
    }

    const mergedApplicant = {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || "",
      ...(applicant || {})
    };

    if (application) {
      application.applicant = mergedApplicant;
      application.kycDocuments = kycDocuments || application.kycDocuments;
      application.status = "pending";
      application.remarks = "";
      application.reviewedBy = undefined;
      await application.save();
    } else {
      application = await MembershipApplication.create({
        user: userId,
        cooperative: cooperativeId,
        applicant: mergedApplicant,
        kycDocuments: kycDocuments || {},
        status: "pending"
      });
    }

    res.status(201).json({
      success: true,
      message: "Application submitted",
      application
    });
    emitToCooperative(cooperativeId, "kyc:applied", application);
    emitToAdmins("kyc:applied", application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================
// MEMBER CHECK OWN APPLICATIONS
// ======================================

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await MembershipApplication.find({
      user: req.user._id
    })
      .populate("cooperative", "name address district province logo registrationNo")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================
// MANAGER VIEW APPLICATIONS
// ======================================

exports.getCooperativeKycRequests = async (req, res) => {
  try {
    const cooperativeId = req.params.cooperativeId;

    // Only managers/admins of this cooperative (or admin) may view
    const allowed =
      req.user.role === "admin" ||
      (req.user.cooperativeId && req.user.cooperativeId.toString() === cooperativeId);
    if (!allowed) {
      return res.status(403).json({ message: "You are not authorized to view these applications" });
    }

    const applications = await MembershipApplication.find({
      cooperative: cooperativeId
    })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================
// APPROVE
// ======================================

exports.approveCooperativeKyc = async (req, res) => {
  try {
    const application = await MembershipApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const cooperativeId = application.cooperative;

    const allowed =
      req.user.role === "admin" ||
      (req.user.cooperativeId && req.user.cooperativeId.toString() === cooperativeId.toString());
    if (!allowed) {
      return res.status(403).json({ message: "You are not authorized to approve this application" });
    }

    // Build the member's digital records FIRST, then flip the application.
    // If any step below fails, the application stays "pending" (still visible
    // to the manager) instead of approving a member that has no customer
    // record or savings account.
    const user = await User.findById(application.user);
    let account = null;

    if (user) {
      user.role = "member";
      user.status = "active";
      user.isVerified = true;
      if (!(user.cooperatives || []).some(id => id.toString() === cooperativeId.toString())) {
        user.cooperatives.push(cooperativeId);
      }

      // Create a proper Customer record for the member (digital registration).
      const a = application.applicant || {};
      let customer = await Customer.findOne({ phone: a.phone || user.phone, cooperativeId });
      if (!customer) {
        customer = await Customer.create({
          name: a.name || user.name,
          phone: a.phone || user.phone || user.email,
          email: a.email || user.email,
          address: (a.address && a.address.trim()) || "Not provided",
          branch: a.branch || "Head Office",
          gender: a.gender,
          dob: a.dob,
          citizenshipNo: a.citizenshipNo,
          nomineeName: a.nomineeName,
          nomineeRelation: a.nomineeRelation,
          nomineePhone: a.nomineePhone,
          documents: application.kycDocuments || {},
          status: "active",
          cooperativeId,
          userId: application.user
        });
      } else if (!customer.userId) {
        // Backfill the link for customers created by older versions.
        customer.userId = application.user;
        customer.status = "active";
        // Older records may predate required fields; never let approval fail
        // because a legacy customer is missing an address or branch.
        if (!customer.address) customer.address = "Not provided";
        if (!customer.branch) customer.branch = "Head Office";
        await customer.save();
      }

      // Every approved membership automatically owns a savings account in
      // that cooperative. A member joining multiple cooperatives therefore
      // gets one distinct account per cooperative.
      account = await getOrCreateSavingsAccount(customer, cooperativeId);

      // Only claim the primary portal the first time; subsequent approvals
      // must not steal the pointers away from the existing portal.
      if (!user.customerId) user.customerId = customer._id;
      if (!user.cooperativeId) user.cooperativeId = cooperativeId;
      await user.save();
    }

    // All member-facing data exists now. Mark the application approved and
    // register the member on the cooperative.
    application.status = "approved";
    application.reviewedBy = req.user._id;
    await application.save();

    await Cooperative.findByIdAndUpdate(cooperativeId, {
      $addToSet: { members: application.user }
    });

    res.json({
      success: true,
      message: "Member approved",
      account: account ? { _id: account._id, accountNo: account.accountNo } : null
    });
    emitToCooperative(cooperativeId, "kyc:updated", application);
    emitToAdmins("kyc:updated", application);
    emitToUser(application.user, "kyc:updated", application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================
// REJECT
// ======================================

exports.rejectCooperativeKyc = async (req, res) => {
  try {
    const { remarks } = req.body;

    const application = await MembershipApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const allowed =
      req.user.role === "admin" ||
      (req.user.cooperativeId && req.user.cooperativeId.toString() === application.cooperative.toString());
    if (!allowed) {
      return res.status(403).json({ message: "You are not authorized to reject this application" });
    }

    application.status = "rejected";
    application.remarks = remarks || "";
    application.reviewedBy = req.user._id;

    await application.save();

    res.json({ success: true, message: "Application rejected" });
    emitToCooperative(application.cooperative, "kyc:updated", application);
    emitToAdmins("kyc:updated", application);
    emitToUser(application.user, "kyc:updated", application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================================
// NEED MORE DOCUMENTS
// ======================================

exports.insufficientKyc = async (req, res) => {
  try {
    const { remarks } = req.body;

    const application = await MembershipApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const allowed =
      req.user.role === "admin" ||
      (req.user.cooperativeId && req.user.cooperativeId.toString() === application.cooperative.toString());
    if (!allowed) {
      return res.status(403).json({ message: "You are not authorized to update this application" });
    }

    application.status = "insufficient";
    application.remarks = remarks;

    await application.save();

    res.json({ success: true, message: "More documents requested" });
    emitToCooperative(application.cooperative, "kyc:updated", application);
    emitToAdmins("kyc:updated", application);
    emitToUser(application.user, "kyc:updated", application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
