const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkDealLimit, checkFeatureAccess } = require('../middleware/featureAccess');
const { validateObjectId } = require('../middleware/validation');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Task = require('../models/Task');

// Get all deals for a user
router.get('/', auth, async (req, res) => {
  // Log incoming requests for debugging device/backend connectivity
  console.log(`[deals route] incoming GET /api/deals from userId=${req.user._id} query=${JSON.stringify(req.query)}`);
  try {
    const { stage, status, sort } = req.query;
    let query = { userId: req.user._id };

    if (stage) query.stage = stage;
    if (status) query.status = status;

    const deals = await Deal.find(query)
      .populate('contact')
      .sort(sort === 'desc' ? { amount: -1 } : { createdAt: -1 });

    res.json({ deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Create deal
router.post('/', auth, checkDealLimit, async (req, res) => {
  try {
    const { name, amount, stage, probability, contact, clarityScore } = req.body;

    const deal = new Deal({
      userId: req.user._id,
      name: name || 'New Deal',
      amount: amount || 0,
      stage: stage || 'discovery',
      probability: probability || 50,
      contact: contact || {},
      clarityScore: clarityScore || 0,
      status: 'open'
    });

    await deal.save();

    // If contact email provided, find or create contact
    if (contact && contact.email) {
      let existingContact = await Contact.findOne({
        userId: req.user._id,
        email: contact.email
      });

      if (!existingContact) {
        existingContact = new Contact({
          userId: req.user._id,
          firstName: contact.name?.split(' ')[0] || 'Unknown',
          lastName: contact.name?.split(' ')[1] || '',
          email: contact.email,
          phone: contact.phone || ''
        });
        await existingContact.save();
      }

      deal.contact = existingContact._id;
      await deal.save();
    }

    res.json({ deal, message: 'Deal created successfully' });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

// Get deal by ID
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid deal ID format' });
    }

    const deal = await Deal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('contact');

    if (!deal) {
      console.warn(`⚠️ Unauthorized access attempt: User ${req.user._id} tried to access deal ${req.params.id}`);
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
});

// Update deal
router.put('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid deal ID format' });
    }

    const { name, amount, stage, probability, status, clarityScore } = req.body;

    const deal = await Deal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        name: name !== undefined ? name : undefined,
        amount: amount !== undefined ? amount : undefined,
        stage: stage !== undefined ? stage : undefined,
        probability: probability !== undefined ? probability : undefined,
        status: status !== undefined ? status : undefined,
        clarityScore: clarityScore !== undefined ? clarityScore : undefined,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('contact');

    if (!deal) {
      console.warn(`⚠️ Unauthorized update attempt: User ${req.user._id} tried to update deal ${req.params.id}`);
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ deal, message: 'Deal updated' });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// Delete deal
router.delete('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid deal ID format' });
    }

    const deal = await Deal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!deal) {
      console.warn(`⚠️ Unauthorized delete attempt: User ${req.user._id} tried to delete deal ${req.params.id}`);
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deals by stage
router.get('/stage/:stage', auth, async (req, res) => {
  try {
    const deals = await Deal.find({
      userId: req.user._id,
      stage: req.params.stage
    }).populate('contact').sort({ createdAt: -1 });

    res.json({ deals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get deal statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const totalDeals = await Deal.countDocuments({ userId: req.user._id });
    const wonDeals = await Deal.countDocuments({ userId: req.user._id, stage: 'won' });
    const totalValue = await Deal.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const stageBreakdown = await Deal.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$amount' } } }
    ]);

    res.json({
      totalDeals,
      wonDeals,
      totalValue: totalValue[0]?.total || 0,
      winRate: totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0,
      stageBreakdown: Object.fromEntries(
        stageBreakdown.map(s => [s._id, { count: s.count, value: s.value }])
      )
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
