const Cooperative = require('../models/Cooperative');
const { emitToAdmins, emitToCooperative } = require('../services/socketService');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Rating = require('../models/Rating');
const CooperativeProfile = require('../models/CooperativeProfile');

// @desc    Get all cooperatives
// @route   GET /api/cooperatives
// @access  Private/Admin
exports.getCooperatives = async (req, res) => {
  try {
    const cooperatives = await Cooperative.find({});
    res.json(cooperatives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single cooperative
// @route   GET /api/cooperatives/:id
// @access  Private/Admin
exports.getCooperativeById = async (req, res) => {
  try {
    const cooperative = await Cooperative.findById(req.params.id);
    if (cooperative) {
      res.json(cooperative);
    } else {
      res.status(404).json({ message: 'Cooperative not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a cooperative
// @route   POST /api/cooperatives
// @access  Private/Admin
exports.createCooperative = async (req, res) => {

try {


const cooperative = new Cooperative({

    ...req.body,

    status:"active",

    createdBy:req.user._id

});


const createdCooperative =
await cooperative.save();



res.status(201).json(createdCooperative);

emitToAdmins('cooperative:updated', createdCooperative);



}catch(error){

res.status(400).json({
message:error.message
});

}

};

// @desc    Update a cooperative
// @route   PUT /api/cooperatives/:id
// @access  Private/Admin
exports.updateCooperative = async (req, res) => {
  try {
    const cooperative = await Cooperative.findById(req.params.id);
    if (cooperative) {
      Object.assign(cooperative, req.body);
      const updatedCooperative = await cooperative.save();
      res.json(updatedCooperative);
      emitToAdmins('cooperative:updated', updatedCooperative);
      emitToCooperative(updatedCooperative._id, 'cooperative:updated', updatedCooperative);
    } else {
      res.status(404).json({ message: 'Cooperative not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a cooperative
// @route   DELETE /api/cooperatives/:id
// @access  Private/Admin
exports.deleteCooperative = async (req, res) => {
  try {
    const cooperative = await Cooperative.findById(req.params.id);
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }
    const id = cooperative._id;

    // Clean up related records
    await CooperativeProfile.deleteMany({ cooperativeId: id });
    await Rating.deleteMany({ cooperative: id });
    await User.updateMany({ cooperativeId: id }, { cooperativeId: null });
    await cooperative.deleteOne();

    res.json({ message: 'Cooperative deleted', _id: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cooperative status
// @route   PUT /api/cooperatives/:id/status
// @access  Private/Admin
exports.updateCooperativeStatus = async (req, res) => {
  try {
    const { status, subscriptionPlan, subscriptionExpiry } = req.body;
    const cooperative = await Cooperative.findById(req.params.id);
    if (cooperative) {
      if (status) cooperative.status = status;
      if (subscriptionPlan) cooperative.subscriptionPlan = subscriptionPlan;
      if (subscriptionExpiry) cooperative.subscriptionExpiry = subscriptionExpiry;
      const updatedCooperative = await cooperative.save();
      res.json(updatedCooperative);
      emitToAdmins('cooperative:updated', updatedCooperative);
      emitToCooperative(updatedCooperative._id, 'cooperative:updated', updatedCooperative);
    } else {
      res.status(404).json({ message: 'Cooperative not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get Admin Analytics
// @route   GET /api/cooperatives/analytics
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalCooperatives = await Cooperative.countDocuments();
    const activeCooperatives = await Cooperative.countDocuments({ status: 'active' });
    const pendingCooperatives = await Cooperative.countDocuments({ status: 'pending' });
    
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    const subscriptionData = [
      { name: 'Free', value: await Cooperative.countDocuments({ subscriptionPlan: 'free' }) },
      { name: 'Basic', value: await Cooperative.countDocuments({ subscriptionPlan: 'basic' }) },
      { name: 'Premium', value: await Cooperative.countDocuments({ subscriptionPlan: 'premium' }) }
    ];

    res.json({
      totalCooperatives,
      activeCooperatives,
      pendingCooperatives,
      totalUsers,
      subscriptionData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: compute aggregate rating + review count for a set of cooperatives
const buildRatingMap = async (coopIds) => {
  const map = {};
  const agg = await Rating.aggregate([
    { $match: { cooperative: { $in: coopIds }, status: 'published' } },
    {
      $group: {
        _id: '$cooperative',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  agg.forEach(row => {
    map[row._id.toString()] = {
      avgRating: Math.round(row.avgRating * 10) / 10,
      reviewCount: row.reviewCount
    };
  });
  return map;
};

// @desc    Get all public approved cooperatives
// @route   GET /api/cooperatives/public
// @access  Public
exports.getPublicCooperatives = async (req, res) => {
  try {
    const cooperatives = await Cooperative.find({ status: 'active' })
      .select('-createdAt -updatedAt -managers -createdBy')
      .lean();
    const profiles = await CooperativeProfile.find({}).lean();

    const coopIds = cooperatives.map(c => c._id);
    const ratingMap = await buildRatingMap(coopIds);
    const memberCounts = await Cooperative.aggregate([
      { $match: { _id: { $in: coopIds } } },
      { $project: { _id: 1, memberCount: { $size: { $ifNull: ['$members', []] } } } }
    ]);
    const memberMap = {};
    memberCounts.forEach(row => { memberMap[row._id.toString()] = row.memberCount; });

    // Merge basic info with profile (if exists) for directory view
    const result = cooperatives.map(coop => {
      const profile = profiles.find(p => p.cooperativeId.toString() === coop._id.toString());
      const rating = ratingMap[coop._id.toString()] || { avgRating: 0, reviewCount: 0 };
      return {
        _id: coop._id,
        name: coop.name,
        address: coop.address,
        district: coop.district,
        province: coop.province,
        category: coop.category,
        establishedYear: coop.establishedYear,
        contactEmail: coop.contactEmail,
        contactPhone: coop.contactPhone,
        logo: profile ? profile.logo : '',
        description: profile ? profile.description : '',
        avgRating: rating.avgRating,
        reviewCount: rating.reviewCount,
        memberCount: memberMap[coop._id.toString()] || (profile ? profile.stats?.memberCount : 0) || 0,
        loanProducts: profile ? (profile.loanProducts || []) : []
      };
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get full public profile for a cooperative
// @route   GET /api/cooperatives/public/:id
// @access  Public
exports.getPublicCooperativeProfile = async (req, res) => {
  try {
    const cooperative = await Cooperative.findOne({ _id: req.params.id, status: 'active' });
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found or inactive' });
    }
    let profile = await CooperativeProfile.findOne({ cooperativeId: cooperative._id }).lean();
    if (!profile) {
      profile = {}; // Fallback if no profile created yet
    }

    const ratingMap = await buildRatingMap([cooperative._id]);
    const rating = ratingMap[cooperative._id.toString()] || { avgRating: 0, reviewCount: 0 };

    const safeCooperative = { ...cooperative.toObject() };
    safeCooperative.memberCount = safeCooperative.members ? safeCooperative.members.length : 0;
    delete safeCooperative.members;
    delete safeCooperative.managers;

    res.json({
      cooperative: safeCooperative,
      profile,
      rating: { avgRating: rating.avgRating, reviewCount: rating.reviewCount },
      reviewCount: rating.reviewCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public reviews for a cooperative
// @route   GET /api/cooperatives/public/:id/reviews
// @access  Public
exports.getCooperativeReviews = async (req, res) => {
  try {
    const cooperative = await Cooperative.findOne({ _id: req.params.id, status: 'active' });
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found or inactive' });
    }

    const reviews = await Rating.find({ cooperative: cooperative._id, status: 'published' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const agg = await Rating.aggregate([
      { $match: { cooperative: cooperative._id, status: 'published' } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);
    const breakdown = await Rating.aggregate([
      { $match: { cooperative: cooperative._id, status: 'published' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    const breakdownMap = {};
    breakdown.forEach(b => { breakdownMap[b._id] = b.count; });
    const distribution = [5, 4, 3, 2, 1].map(star => ({
      stars: star,
      count: breakdownMap[star] || 0
    }));

    res.json({
      success: true,
      summary: {
        avgRating: agg.length ? Math.round(agg[0].avgRating * 10) / 10 : 0,
        reviewCount: agg.length ? agg[0].reviewCount : 0,
        distribution
      },
      reviews: reviews.map(r => ({
        _id: r._id,
        rating: r.rating,
        title: r.title,
        review: r.review,
        isMember: r.isMember,
        createdAt: r.createdAt,
        user: { name: r.user ? r.user.name : 'Anonymous' }
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a rating / review for a cooperative
// @route   POST /api/cooperatives/:id/ratings
// @access  Private
exports.submitCooperativeRating = async (req, res) => {
  try {
    const { rating, title, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const cooperative = await Cooperative.findById(req.params.id);
    if (!cooperative) {
      return res.status(404).json({ message: 'Cooperative not found' });
    }

    const isMember =
      (req.user.cooperativeId && req.user.cooperativeId.toString() === req.params.id) ||
      (req.user.cooperatives || []).some(id => id.toString() === req.params.id);

    const existing = await Rating.findOne({ cooperative: req.params.id, user: req.user._id });
    if (existing) {
      existing.rating = rating;
      existing.title = title || '';
      existing.review = review || '';
      existing.isMember = isMember;
      existing.status = 'published';
      await existing.save();
      return res.json({ success: true, message: 'Rating updated', rating: existing });
    }

    const created = await Rating.create({
      cooperative: req.params.id,
      user: req.user._id,
      rating,
      title: title || '',
      review: review || '',
      isMember,
      status: 'published'
    });

    res.status(201).json({ success: true, message: 'Rating submitted', rating: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get own cooperative (basic info + profile) for the logged-in manager
// @route   GET /api/cooperatives/me
// @access  Private (Manager/Admin of the tenant)
exports.getMyCooperative = async (req, res) => {
  try {
    // Manager has no cooperative yet - frontend will show the "create" form
    if (!req.user.cooperativeId) {
      return res.json({ cooperative: null, profile: null });
    }

    const cooperative = await Cooperative.findById(req.user.cooperativeId);
    if (!cooperative) {
      return res.json({ cooperative: null, profile: null });
    }

    const profile = await CooperativeProfile.findOne({ cooperativeId: cooperative._id }).lean();

    res.json({
      cooperative,
      profile: profile || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update own cooperative (basic info + profile) for the logged-in manager.
//          If the manager has no cooperative yet, this CREATES one and links it
//          to the manager account.
// @route   PUT /api/cooperatives/me
// @access  Private (Manager/Admin of the tenant)
exports.updateMyCooperative = async (req, res) => {
  try {
    const { profile: profileData, ...basicData } = req.body || {};

    // Only allow editing of non-restricted basic fields
    const allowedBasic = [
      'name', 'address', 'district', 'province', 'establishedYear',
      'category', 'contactEmail', 'contactPhone', 'registrationNo'
    ];

    let cooperative = req.user.cooperativeId
      ? await Cooperative.findById(req.user.cooperativeId)
      : null;

    if (!cooperative) {
      // Manager has no cooperative yet - create one from the submitted details
      const createdData = {};
      allowedBasic.forEach(field => {
        if (basicData[field] !== undefined) createdData[field] = basicData[field];
      });

      if (!createdData.name || !createdData.address || !createdData.contactEmail || !createdData.contactPhone) {
        return res.status(400).json({ message: 'Please provide cooperative name, address, contact email and phone' });
      }

      cooperative = new Cooperative({
        ...createdData,
        status: 'active',
        createdBy: req.user._id,
        managers: [req.user._id]
      });
      cooperative = await cooperative.save();

      // Link the manager to their newly created cooperative
      req.user.cooperativeId = cooperative._id;
      await req.user.save();
    } else {
      allowedBasic.forEach(field => {
        if (basicData[field] !== undefined) cooperative[field] = basicData[field];
      });
      cooperative = await cooperative.save();
    }

    // Update or create the profile
    let profile = await CooperativeProfile.findOne({ cooperativeId: cooperative._id });
    if (profile) {
      if (profileData) Object.assign(profile, profileData);
      await profile.save();
    } else {
      profile = await CooperativeProfile.create({ cooperativeId: cooperative._id, ...(profileData || {}) });
    }

    res.json({ cooperative, profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update or create cooperative profile
// @route   PUT /api/cooperatives/:id/profile
// @access  Private (Admin of the tenant)
exports.updateCooperativeProfile = async (req, res) => {
  try {
    const cooperativeId = req.params.id;
    // Basic security: only allow the tenant's admin to update their own profile, 
    // but right now role middleware is handling basic auth. We assume the route is protected.
    
    let profile = await CooperativeProfile.findOne({ cooperativeId });
    if (profile) {
      Object.assign(profile, req.body);
      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      profile = new CooperativeProfile({ ...req.body, cooperativeId });
      const createdProfile = await profile.save();
      res.status(201).json(createdProfile);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
