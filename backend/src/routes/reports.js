const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Task = require('../models/Task');
const Note = require('../models/Note');

// Generate sales report
router.get('/sales-summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { userId: req.user._id };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const deals = await Deal.find(query);
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const wonDeals = deals.filter(d => d.stage === 'won');
    const wonValue = wonDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

    const byStage = {
      discovery: deals.filter(d => d.stage === 'discovery').length,
      demo: deals.filter(d => d.stage === 'demo').length,
      proposal: deals.filter(d => d.stage === 'proposal').length,
      negotiation: deals.filter(d => d.stage === 'negotiation').length,
      won: wonDeals.length,
      lost: deals.filter(d => d.stage === 'lost').length
    };

    res.json({
      totalDeals,
      totalValue,
      wonDeals: wonDeals.length,
      wonValue,
      winRate: totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0,
      byStage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate activity report
router.get('/activity-report', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { userId: req.user._id };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const calls = await Note.countDocuments({ ...query, type: 'call-summary' });
    const emails = await Note.countDocuments({ ...query, type: 'email' });
    const meetings = await Note.countDocuments({ ...query, type: 'meeting-summary' });
    const tasks = await Task.find(query);
    const completedTasks = tasks.filter(t => t.status === 'completed').length;

    res.json({
      calls,
      emails,
      meetings,
      totalActivities: calls + emails + meetings,
      tasksCreated: tasks.length,
      tasksCompleted: completedTasks,
      completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate forecast report
router.get('/forecast', auth, async (req, res) => {
  try {
    const deals = await Deal.find({ userId: req.user._id, stage: { $ne: 'won', $ne: 'lost' } });

    const forecast = deals.reduce((total, deal) => {
      const weightedAmount = (deal.amount || 0) * ((deal.probability || 0) / 100);
      return total + weightedAmount;
    }, 0);

    const byStage = {};
    const stages = ['discovery', 'demo', 'proposal', 'negotiation'];
    stages.forEach(stage => {
      const stageDeal = deals.filter(d => d.stage === stage);
      byStage[stage] = stageDeal.reduce((total, d) => total + ((d.amount || 0) * ((d.probability || 0) / 100)), 0);
    });

    res.json({
      totalForecast: forecast,
      bestCase: deals.reduce((sum, d) => sum + (d.amount || 0), 0),
      worstCase: deals.filter(d => d.probability > 50).reduce((sum, d) => sum + (d.amount || 0), 0),
      byStage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pipeline velocity
router.get('/velocity', auth, async (req, res) => {
  try {
    const deals = await Deal.find({ userId: req.user._id });

    const monthlyData = {};
    deals.forEach(deal => {
      const month = new Date(deal.createdAt).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { created: 0, value: 0 };
      }
      monthlyData[month].created++;
      monthlyData[month].value += deal.amount || 0;
    });

    res.json({ monthlyData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
