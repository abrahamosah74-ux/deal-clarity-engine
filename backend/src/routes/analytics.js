const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Task = require('../models/Task');

// Get sales pipeline summary
router.get('/pipeline', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const pipeline = await Deal.aggregate([
      { $match: { userId: req.user._id, ...dateFilter } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgProbability: { $avg: '$probability' },
          avgClarityScore: { $avg: '$clarityScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(pipeline);
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// Get sales velocity metrics
router.get('/velocity', auth, async (req, res) => {
  try {
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const velocity = await Deal.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          dealsCreated: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgDaysInPipeline: { $avg: '$velocity.totalDays' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(velocity);
  } catch (error) {
    console.error('Get velocity error:', error);
    res.status(500).json({ error: 'Failed to fetch velocity metrics' });
  }
});

// Get sales forecast
router.get('/forecast', auth, async (req, res) => {
  try {
    const forecast = await Deal.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgProbability: { $avg: '$probability' },
          weightedAmount: {
            $sum: {
              $multiply: [
                { $divide: ['$probability', 100] },
                { $ifNull: ['$amount', 0] }
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          count: 1,
          totalAmount: { $round: ['$totalAmount', 2] },
          avgProbability: { $round: ['$avgProbability', 2] },
          weightedAmount: { $round: ['$weightedAmount', 2] },
          expectedRevenue: { $round: ['$weightedAmount', 2] }
        }
      }
    ]);

    const totalForecast = forecast.reduce((sum, stage) => sum + (stage.weightedAmount || 0), 0);

    res.json({
      byStage: forecast,
      totalForecast: parseFloat(totalForecast.toFixed(2))
    });
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast' });
  }
});

// Get conversion metrics
router.get('/conversion', auth, async (req, res) => {
  try {
    const { stage = 'discovery' } = req.query;

    const deals = await Deal.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate conversion rates between stages
    const stageOrder = ['discovery', 'demo', 'proposal', 'negotiation', 'won'];
    const conversions = {};

    for (let i = 0; i < stageOrder.length - 1; i++) {
      const currentStage = deals.find(d => d._id === stageOrder[i]);
      const nextStage = deals.find(d => d._id === stageOrder[i + 1]);

      const currentCount = currentStage?.count || 0;
      const nextCount = nextStage?.count || 0;

      conversions[`${stageOrder[i]}_to_${stageOrder[i + 1]}`] = currentCount > 0 ? parseFloat(((nextCount / currentCount) * 100).toFixed(2)) : 0;
    }

    res.json(conversions);
  } catch (error) {
    console.error('Get conversion error:', error);
    res.status(500).json({ error: 'Failed to fetch conversion metrics' });
  }
});

// Get top deals
router.get('/top-deals', auth, async (req, res) => {
  try {
    const { limit = 10, minAmount = 0 } = req.query;

    const topDeals = await Deal.find({
      userId: req.user._id,
      amount: { $gte: parseInt(minAmount) }
    })
      .sort({ amount: -1 })
      .limit(parseInt(limit))
      .select('name amount stage probability clarityScore contact');

    res.json(topDeals);
  } catch (error) {
    console.error('Get top deals error:', error);
    res.status(500).json({ error: 'Failed to fetch top deals' });
  }
});

// Get dashboard summary
router.get('/summary', auth, async (req, res) => {
  try {
    const [dealStats, contactStats, taskStats] = await Promise.all([
      Deal.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalDeals: { $sum: 1 },
            totalRevenue: { $sum: '$amount' },
            avgDealSize: { $avg: '$amount' },
            avgClarityScore: { $avg: '$clarityScore' },
            wonDeals: {
              $sum: { $cond: [{ $eq: ['$stage', 'won'] }, 1, 0] }
            }
          }
        }
      ]),
      Contact.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalContacts: { $sum: 1 },
            avgLeadScore: { $avg: '$leadScore' },
            highPriorityLeads: {
              $sum: { $cond: [{ $gte: ['$leadScore', 80] }, 1, 0] }
            }
          }
        }
      ]),
      Task.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            overdueTasks: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', 'completed'] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const dealData = dealStats[0] || { totalDeals: 0, totalRevenue: 0, avgDealSize: 0, avgClarityScore: 0, wonDeals: 0 };
    const contactData = contactStats[0] || { totalContacts: 0, avgLeadScore: 0, highPriorityLeads: 0 };
    const taskData = taskStats[0] || { totalTasks: 0, completedTasks: 0, overdueTasks: 0 };

    res.json({
      deals: {
        total: dealData.totalDeals,
        revenue: parseFloat((dealData.totalRevenue || 0).toFixed(2)),
        avgDealSize: parseFloat((dealData.avgDealSize || 0).toFixed(2)),
        avgClarityScore: parseFloat((dealData.avgClarityScore || 0).toFixed(2)),
        won: dealData.wonDeals,
        winRate: dealData.totalDeals > 0 ? parseFloat(((dealData.wonDeals / dealData.totalDeals) * 100).toFixed(2)) : 0
      },
      contacts: {
        total: contactData.totalContacts,
        avgLeadScore: parseFloat((contactData.avgLeadScore || 0).toFixed(2)),
        highPriority: contactData.highPriorityLeads
      },
      tasks: {
        total: taskData.totalTasks,
        completed: taskData.completedTasks,
        overdue: taskData.overdueTasks,
        completionRate: taskData.totalTasks > 0 ? parseFloat(((taskData.completedTasks / taskData.totalTasks) * 100).toFixed(2)) : 0
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

module.exports = router;
