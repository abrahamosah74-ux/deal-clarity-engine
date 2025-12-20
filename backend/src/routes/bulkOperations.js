const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const auth = require('../middleware/auth');

/**
 * Bulk update deals
 * POST /api/deals/bulk/update
 * { dealIds: [...], updates: {...} }
 */
router.post('/bulk/update', auth, async (req, res) => {
  try {
    const { dealIds, updates } = req.body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return res.status(400).json({ message: 'dealIds array is required' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'updates object is required' });
    }

    // Ensure user can only update their team's deals
    const deals = await Deal.find({
      _id: { $in: dealIds },
      team: req.user.team
    });

    if (deals.length !== dealIds.length) {
      return res.status(403).json({ message: 'You do not have permission to update some of these deals' });
    }

    // Perform bulk update
    const result = await Deal.updateMany(
      { _id: { $in: dealIds }, team: req.user.team },
      {
        ...updates,
        updatedAt: new Date()
      }
    );

    res.json({
      message: `Updated ${result.modifiedCount} deals`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Bulk delete deals
 * POST /api/deals/bulk/delete
 * { dealIds: [...] }
 */
router.post('/bulk/delete', auth, async (req, res) => {
  try {
    const { dealIds } = req.body;

    if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
      return res.status(400).json({ message: 'dealIds array is required' });
    }

    // Ensure user can only delete their team's deals
    const deals = await Deal.find({
      _id: { $in: dealIds },
      team: req.user.team
    });

    if (deals.length !== dealIds.length) {
      return res.status(403).json({ message: 'You do not have permission to delete some of these deals' });
    }

    const result = await Deal.deleteMany({
      _id: { $in: dealIds },
      team: req.user.team
    });

    res.json({
      message: `Deleted ${result.deletedCount} deals`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Bulk assign deals to team member
 * POST /api/deals/bulk/assign
 * { dealIds: [...], assignedTo: userId }
 */
router.post('/bulk/assign', auth, async (req, res) => {
  try {
    const { dealIds, assignedTo } = req.body;

    if (!dealIds || !Array.isArray(dealIds)) {
      return res.status(400).json({ message: 'dealIds array is required' });
    }

    if (!assignedTo) {
      return res.status(400).json({ message: 'assignedTo user ID is required' });
    }

    // Verify all deals belong to user's team
    const deals = await Deal.find({
      _id: { $in: dealIds },
      team: req.user.team
    });

    if (deals.length !== dealIds.length) {
      return res.status(403).json({ message: 'You do not have permission to modify some of these deals' });
    }

    const result = await Deal.updateMany(
      { _id: { $in: dealIds }, team: req.user.team },
      { assignedTo },
      { new: true }
    );

    res.json({
      message: `Assigned ${result.modifiedCount} deals`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Bulk change deal stage
 * POST /api/deals/bulk/stage
 * { dealIds: [...], stage: 'won'|'lost'|'negotiation' }
 */
router.post('/bulk/stage', auth, async (req, res) => {
  try {
    const { dealIds, stage } = req.body;

    if (!dealIds || !Array.isArray(dealIds)) {
      return res.status(400).json({ message: 'dealIds array is required' });
    }

    if (!stage) {
      return res.status(400).json({ message: 'stage is required' });
    }

    // Verify all deals belong to user's team
    const deals = await Deal.find({
      _id: { $in: dealIds },
      team: req.user.team
    });

    if (deals.length !== dealIds.length) {
      return res.status(403).json({ message: 'You do not have permission to modify some of these deals' });
    }

    const updateData = { stage };

    // Auto-populate winDate/lossDate based on stage
    if (stage === 'won') {
      updateData.winDate = new Date();
    } else if (stage === 'lost') {
      updateData.lossDate = new Date();
    }

    const result = await Deal.updateMany(
      { _id: { $in: dealIds }, team: req.user.team },
      updateData
    );

    res.json({
      message: `Updated ${result.modifiedCount} deals to stage: ${stage}`,
      modifiedCount: result.modifiedCount,
      stage
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Bulk add tags to deals
 * POST /api/deals/bulk/tags
 * { dealIds: [...], tags: ['tag1', 'tag2'] }
 */
router.post('/bulk/tags', auth, async (req, res) => {
  try {
    const { dealIds, tags, action = 'add' } = req.body;

    if (!dealIds || !Array.isArray(dealIds)) {
      return res.status(400).json({ message: 'dealIds array is required' });
    }

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ message: 'tags array is required' });
    }

    // Verify all deals belong to user's team
    const deals = await Deal.find({
      _id: { $in: dealIds },
      team: req.user.team
    });

    if (deals.length !== dealIds.length) {
      return res.status(403).json({ message: 'You do not have permission to modify some of these deals' });
    }

    const updateOp = action === 'remove' ? { $pullAll: { tags } } : { $addToSet: { tags: { $each: tags } } };

    const result = await Deal.updateMany(
      { _id: { $in: dealIds }, team: req.user.team },
      updateOp
    );

    res.json({
      message: `${action === 'remove' ? 'Removed' : 'Added'} tags to ${result.modifiedCount} deals`,
      modifiedCount: result.modifiedCount,
      action
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Bulk export deals to CSV
 * GET /api/deals/bulk/export?dealIds=id1,id2,id3
 */
router.get('/bulk/export', auth, async (req, res) => {
  try {
    const { dealIds } = req.query;

    if (!dealIds) {
      return res.status(400).json({ message: 'dealIds query parameter is required' });
    }

    const ids = dealIds.split(',');
    const deals = await Deal.find({
      _id: { $in: ids },
      team: req.user.team
    }).populate('contact', 'name email company');

    if (deals.length === 0) {
      return res.status(404).json({ message: 'No deals found' });
    }

    // Generate CSV
    const csv = generateCSV(deals);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="deals-export-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get bulk action progress/status
 * GET /api/deals/bulk/status/:operationId
 */
router.get('/bulk/status/:operationId', auth, async (req, res) => {
  try {
    // This would connect to a job queue system in production
    // For now, return a simple status
    res.json({
      operationId: req.params.operationId,
      status: 'completed',
      processed: 100,
      total: 100,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Helper function to generate CSV
function generateCSV(deals) {
  const headers = ['ID', 'Deal Name', 'Contact', 'Company', 'Value', 'Stage', 'Probability', 'Created At'];
  const rows = deals.map(d => [
    d._id,
    d.dealName,
    d.contact?.name || '',
    d.contact?.company || '',
    d.value || 0,
    d.stage,
    d.probability || 0,
    d.createdAt
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

module.exports = router;
