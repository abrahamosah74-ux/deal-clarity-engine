const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { connectDB } = require('../config/database');
const User = require('../models/User');
const Team = require('../models/Team');
const Deal = require('../models/Deal');

async function seed(email = 'testuser4+qa@example.com') {
  await connectDB();

  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    console.log('User not found, creating a seed user...');
    user = new User({
      name: 'Seed User',
      email,
      password: 'Password123!',
      company: 'Personal'
    });
    await user.save();
    console.log('Created user:', user._id.toString());
  } else {
    console.log('Found user:', user._id.toString());
  }

  // Find or create a team for this user
  let team = null;
  if (user.currentTeam) {
    team = await Team.findById(user.currentTeam);
  }
  if (!team && Array.isArray(user.teams) && user.teams.length > 0) {
    team = await Team.findById(user.teams[0]);
  }
  if (!team) {
    console.log('Creating a team for the seed user...');
    team = new Team({
      name: `${user.name}'s Team`,
      owner: user._id,
      members: [{ user: user._id, role: 'admin' }]
    });
    await team.save();
    user.teams = user.teams || [];
    user.teams.push(team._id);
    user.currentTeam = team._id;
    await user.save();
    console.log('Created team:', team._id.toString());
  } else {
    console.log('Using existing team:', team._id.toString());
  }

  // Create sample deals
  const samples = [
    { name: 'Acme Corp Website Redesign', amount: 12000, stage: 'Proposal', probability: 60 },
    { name: 'Beta Inc Onboarding', amount: 5000, stage: 'Demo', probability: 40 },
    { name: 'Gamma LLC Annual Contract', amount: 45000, stage: 'Negotiation', probability: 70 }
  ];

  const created = [];
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const deal = new Deal({
      userId: user._id,
      team: team._id,
      crmId: `seed-${Date.now()}-${i}`,
      crmType: 'other',
      name: s.name,
      amount: s.amount,
      stage: s.stage,
      probability: s.probability,
      contact: { name: 'Seed Contact', email: `seed+${i}@example.com`, phone: '' },
      clarityScore: Math.floor(Math.random() * 100)
    });
    await deal.save();
    created.push(deal);
    console.log('Created deal:', deal._id.toString(), deal.name);
  }

  console.log(`Seed complete. Created ${created.length} deals for user ${user.email}`);
  process.exit(0);
}

// Allow running with node src/scripts/seedDeals.js [email]
const emailArg = process.argv[2] || 'testuser4+qa@example.com';
seed(emailArg).catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
