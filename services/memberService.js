const Customer = require('../models/Customer');

// All Customer records belonging to a platform user. A member can be linked
// to one Customer per cooperative, so every membership shows up here.
async function getMemberCustomers(user) {
  if (!user || !user._id) return [];
  let customers = await Customer.find({ userId: user._id });
  // Legacy fallback: customer rows created before the userId link was added
  // (or seeded accounts) are found through the old user.customerId pointer.
  if (customers.length === 0 && user.customerId) {
    customers = await Customer.find({ _id: user.customerId });
  }
  return customers;
}

// Resolve which customer/cooperative a member request applies to.
// - requestedCooperativeId: explicit (query/body) selection from the frontend
//   cooperative switcher. Must match an actual membership.
// - Otherwise fall back to the user's primary (first active) portal.
async function resolveMemberContext(user, requestedCooperativeId) {
  if (!user || !user._id) return null;

  if (requestedCooperativeId) {
    const coopId = String(requestedCooperativeId);
    let customer = await Customer.findOne({ userId: user._id, cooperativeId: coopId });
    if (!customer && user.customerId) {
      customer = await Customer.findOne({ _id: user.customerId, cooperativeId: coopId });
    }
    if (!customer) return null;
    return { customerId: customer._id, cooperativeId: String(customer.cooperativeId), customer };
  }

  if (user.customerId) {
    const customer = await Customer.findById(user.customerId);
    if (customer) {
      return { customerId: customer._id, cooperativeId: String(customer.cooperativeId), customer };
    }
  }

  if (user.cooperativeId) {
    const customer = await Customer.findOne({ cooperativeId: user.cooperativeId, userId: user._id });
    if (customer) {
      return { customerId: customer._id, cooperativeId: String(customer.cooperativeId), customer };
    }
  }

  const first = await Customer.findOne({ userId: user._id, status: 'active' }).sort({ createdAt: 1 });
  if (first) {
    return { customerId: first._id, cooperativeId: String(first.cooperativeId), customer: first };
  }

  return null;
}

// True when a document carrying a `customerId` (Account, Loan, Payment, ...)
// belongs to the given platform user through any of their memberships.
async function entityBelongsToUser(doc, user) {
  if (!doc || !doc.customerId || !user || !user._id) return false;
  if (user.customerId && String(doc.customerId) === String(user.customerId)) return true;
  const customer = await Customer.findById(doc.customerId);
  return Boolean(customer && String(customer.userId) === String(user._id));
}

module.exports = { getMemberCustomers, resolveMemberContext, entityBelongsToUser };
