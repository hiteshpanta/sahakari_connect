// One-off data repair.
// The old approveCooperativeKyc flipped the application to "approved" BEFORE
// creating the Customer record, so failed approvals (e.g. the missing-address
// validation bug) left MembershipApplication rows stuck in "approved" with no
// actual member record. Because of the unique {user, cooperative} index the
// member can never re-apply. This script resets those orphaned approvals back
// to "pending" so the member can apply again and the manager can re-approve.
//
// Run from the backend folder:  node scripts/fixStuckKyc.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MembershipApplication = require('../models/CooperativeKyc');
const Customer = require('../models/Customer');
const Cooperative = require('../models/Cooperative');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const approved = await MembershipApplication.find({ status: 'approved' });
  console.log(`Found ${approved.length} approved application(s)`);

  let reset = 0;
  let kept = 0;
  let errors = 0;

  for (const app of approved) {
    try {
      const customer = await Customer.findOne({
        userId: app.user,
        cooperativeId: app.cooperative
      });
      const isRealMember = Boolean(customer && customer.status === 'active');

      if (isRealMember) {
        kept++;
        console.log(`KEEP  app=${app._id} user=${app.user} coop=${app.cooperative} (member ok)`);
      } else {
        // Orphaned approval: no active member record -> allow re-application.
        app.status = 'pending';
        app.remarks = '';
        app.reviewedBy = undefined;
        await app.save();
        await Cooperative.updateOne(
          { _id: app.cooperative },
          { $pull: { members: app.user } }
        );
        reset++;
        console.log(`RESET app=${app._id} user=${app.user} coop=${app.cooperative} -> pending`);
      }
    } catch (err) {
      errors++;
      console.error(`ERROR app=${app._id}: ${err.message}`);
    }
  }

  console.log(`\nDone. reset=${reset} kept=${kept} errors=${errors}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
