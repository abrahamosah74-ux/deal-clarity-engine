// backend/src/routes/teams.js
const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const TeamInvite = require('../models/TeamInvite');
const User = require('../models/User');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const crypto = require('crypto');

// Middleware to check team membership
const checkTeamAccess = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const member = team.members.find(m => m.user.toString() === req.user.id);
    if (!member && team.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this team' });
    }

    req.team = team;
    req.teamMember = member;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new team
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, industry, website } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = new Team({
      name: name.trim(),
      description: description || '',
      industry: industry || '',
      website: website || '',
      owner: req.user.id,
      members: [{
        user: req.user.id,
        role: 'admin',
        permissions: {
          canViewReports: true,
          canManageTeam: true,
          canDeleteDeals: true,
          canManageIntegrations: true
        }
      }]
    });

    await team.save();
    await team.populate('owner', 'name email');
    await team.populate('members.user', 'name email');

    // Add team to user's teams array and set as current team
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id },
      currentTeam: team._id
    });

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all teams for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ teams });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single team
router.get('/:teamId', auth, checkTeamAccess, async (req, res) => {
  try {
    await req.team.populate('owner', 'name email');
    await req.team.populate('members.user', 'name email');

    res.json({ team: req.team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update team details
router.put('/:teamId', auth, checkTeamAccess, async (req, res) => {
  try {
    // Only owner and admins can update team
    if (req.team.owner.toString() !== req.user.id && req.teamMember?.role !== 'admin') {
      return res.status(403).json({ message: 'Only team admins can update team settings' });
    }

    const { name, description, industry, website, settings } = req.body;

    if (name) req.team.name = name.trim();
    if (description !== undefined) req.team.description = description;
    if (industry) req.team.industry = industry;
    if (website) req.team.website = website;
    if (settings) req.team.settings = { ...req.team.settings, ...settings };

    await req.team.save();
    await req.team.populate('owner', 'name email');
    await req.team.populate('members.user', 'name email');

    res.json({
      message: 'Team updated successfully',
      team: req.team
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add team member by email
router.post('/:teamId/invite', auth, checkTeamAccess, async (req, res) => {
  try {
    // Only owner and admins can invite
    if (req.team.owner.toString() !== req.user.id && req.teamMember?.role !== 'admin') {
      return res.status(403).json({ message: 'Only team admins can invite members' });
    }

    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already in team
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const memberExists = req.team.members.some(m => m.user.toString() === user._id.toString());
      if (memberExists) {
        return res.status(400).json({ message: 'User is already in this team' });
      }
    }

    // Check if invite already exists
    const existingInvite = await TeamInvite.findOne({
      team: req.team._id,
      email: email.toLowerCase(),
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(400).json({ message: 'Invite already sent to this email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const invite = new TeamInvite({
      team: req.team._id,
      email: email.toLowerCase(),
      role: role || 'member',
      invitedBy: req.user.id,
      token
    });

    await invite.save();

    // TODO: Send email invite with acceptance link
    // const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite/${token}`;

    res.status(201).json({
      message: 'Invite sent successfully',
      invite: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        status: invite.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept team invite
router.post('/invite/:token', async (req, res) => {
  try {
    const invite = await TeamInvite.findOne({ token: req.params.token });

    if (!invite) {
      return res.status(404).json({ message: 'Invalid or expired invite' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ message: 'This invite has already been used' });
    }

    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      return res.status(400).json({ message: 'Invite has expired' });
    }

    // Get current user
    const user = await User.findOne({ email: invite.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found. Please sign up first.' });
    }

    // Add user to team
    const team = await Team.findById(invite.team);
    team.members.push({
      user: user._id,
      role: invite.role,
      permissions: {
        canViewReports: true,
        canManageTeam: invite.role === 'admin' || invite.role === 'manager',
        canDeleteDeals: invite.role === 'admin',
        canManageIntegrations: invite.role === 'admin'
      }
    });

    await team.save();

    // Add team to user's teams
    await User.findByIdAndUpdate(user._id, {
      $push: { teams: team._id }
    });

    invite.status = 'accepted';
    await invite.save();

    res.json({
      message: 'Successfully joined team',
      team: team._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update member role
router.put('/:teamId/members/:memberId/role', auth, checkTeamAccess, async (req, res) => {
  try {
    // Only owner and admins can change roles
    if (req.team.owner.toString() !== req.user.id && req.teamMember?.role !== 'admin') {
      return res.status(403).json({ message: 'Only team admins can change member roles' });
    }

    const { role } = req.body;
    if (!['admin', 'manager', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const member = req.team.members.find(m => m._id.toString() === req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Can't change owner role
    if (req.team.owner.toString() === member.user.toString()) {
      return res.status(400).json({ message: 'Cannot change owner role' });
    }

    member.role = role;
    member.permissions = {
      canViewReports: true,
      canManageTeam: role === 'admin' || role === 'manager',
      canDeleteDeals: role === 'admin',
      canManageIntegrations: role === 'admin'
    };

    await req.team.save();
    await req.team.populate('members.user', 'name email');

    res.json({
      message: 'Member role updated',
      team: req.team
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove member from team
router.delete('/:teamId/members/:memberId', auth, checkTeamAccess, async (req, res) => {
  try {
    // Only owner and admins can remove members
    if (req.team.owner.toString() !== req.user.id && req.teamMember?.role !== 'admin') {
      return res.status(403).json({ message: 'Only team admins can remove members' });
    }

    const member = req.team.members.find(m => m._id.toString() === req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Can't remove owner
    if (req.team.owner.toString() === member.user.toString()) {
      return res.status(400).json({ message: 'Cannot remove team owner' });
    }

    req.team.members = req.team.members.filter(m => m._id.toString() !== req.params.memberId);
    await req.team.save();

    res.json({
      message: 'Member removed from team'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team statistics
router.get('/:teamId/stats', auth, checkTeamAccess, async (req, res) => {
  try {
    const dealsCount = await Deal.countDocuments({ team: req.team._id });
    const contactsCount = await Contact.countDocuments({ team: req.team._id });
    const tasksCount = await Task.countDocuments({ team: req.team._id });
    
    const totalDealValue = await Deal.aggregate([
      { $match: { team: req.team._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const stageBreakdown = await Deal.aggregate([
      { $match: { team: req.team._id } },
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$amount' } } }
    ]);

    res.json({
      stats: {
        totalDeals: dealsCount,
        totalContacts: contactsCount,
        activeTasks: tasksCount,
        totalDealValue: totalDealValue[0]?.total || 0,
        stageBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Switch current team
router.post('/:teamId/switch', auth, checkTeamAccess, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { currentTeam: req.team._id });

    res.json({
      message: 'Team switched successfully',
      team: req.team._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
