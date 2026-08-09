const Branch = require('../models/Branch');

exports.getBranches = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { cooperativeId: req.user.cooperativeId };
    const branches = await Branch.find(filter);
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBranch = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      req.body.cooperativeId = req.user.cooperativeId;
    }
    const branch = new Branch(req.body);
    const createdBranch = await branch.save();
    res.status(201).json(createdBranch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
