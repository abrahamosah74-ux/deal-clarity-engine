const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const auth = require('../middleware/auth');
const { checkFeatureAccess } = require('../middleware/featureAccess');

/**
 * Get pipeline forecast with weighted revenue
 * GET /api/forecasting/pipeline
 */
router.get('/pipeline', auth, checkFeatureAccess('analytics.forecasting'), async (req, res) => {
  try {
    const deals = await Deal.find({
      team: req.user.team,
      stage: { $ne: 'won', $ne: 'lost' }
    });

    const forecast = {
      totalForecast: 0,
      byStage: {},
      byProbability: {},
      topOpportunities: [],
      riskDeals: []
    };

    const stageWeights = {
      'lead': 0.1,
      'prospect': 0.25,
      'proposal': 0.50,
      'negotiation': 0.75
    };

    deals.forEach(deal => {
      const probability = (deal.probability || 50) / 100;
      const stageWeight = stageWeights[deal.stage] || 0.5;
      const weightedValue = (deal.value || 0) * probability * stageWeight;

      forecast.totalForecast += weightedValue;

      if (!forecast.byStage[deal.stage]) {
        forecast.byStage[deal.stage] = { count: 0, value: 0 };
      }
      forecast.byStage[deal.stage].count += 1;
      forecast.byStage[deal.stage].value += weightedValue;

      const probKey = deal.probability >= 75 ? 'high' : deal.probability >= 50 ? 'medium' : 'low';
      if (!forecast.byProbability[probKey]) {
        forecast.byProbability[probKey] = { count: 0, value: 0 };
      }
      forecast.byProbability[probKey].count += 1;
      forecast.byProbability[probKey].value += weightedValue;

      // Top 5 opportunities
      if (forecast.topOpportunities.length < 5) {
        forecast.topOpportunities.push({
          _id: deal._id,
          dealName: deal.dealName,
          value: deal.value,
          probability: deal.probability,
          stage: deal.stage,
          weightedValue
        });
      } else if (weightedValue > forecast.topOpportunities[4].weightedValue) {
        forecast.topOpportunities[4] = {
          _id: deal._id,
          dealName: deal.dealName,
          value: deal.value,
          probability: deal.probability,
          stage: deal.stage,
          weightedValue
        };
        forecast.topOpportunities.sort((a, b) => b.weightedValue - a.weightedValue);
      }

      // Risk deals (high value, low probability)
      if ((deal.value || 0) > 50000 && (deal.probability || 0) < 30) {
        forecast.riskDeals.push({
          _id: deal._id,
          dealName: deal.dealName,
          value: deal.value,
          probability: deal.probability,
          stage: deal.stage,
          risk: 'high'
        });
      }
    });

    forecast.topOpportunities.sort((a, b) => b.weightedValue - a.weightedValue);
    forecast.riskDeals.sort((a, b) => (b.value || 0) - (a.value || 0));

    res.json({ forecast });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get monthly/quarterly revenue forecast
 * GET /api/forecasting/timeline?period=month
 */
router.get('/timeline', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const wonDeals = await Deal.find({
      team: req.user.team,
      stage: 'won',
      winDate: { $exists: true }
    });

    const timeline = {};
    const startDate = new Date();
    startDate.setDate(1);

    wonDeals.forEach(deal => {
      const dealDate = new Date(deal.winDate);
      let key;

      if (period === 'month') {
        key = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'quarter') {
        const quarter = Math.floor(dealDate.getMonth() / 3) + 1;
        key = `${dealDate.getFullYear()}-Q${quarter}`;
      }

      if (!timeline[key]) {
        timeline[key] = { revenue: 0, count: 0 };
      }
      timeline[key].revenue += deal.value || 0;
      timeline[key].count += 1;
    });

    // Get forecast for next periods
    const deals = await Deal.find({
      team: req.user.team,
      stage: { $ne: 'won', $ne: 'lost' }
    });

    const forecast = {};
    const stageWeights = {
      'lead': 0.1,
      'prospect': 0.25,
      'proposal': 0.50,
      'negotiation': 0.75
    };

    deals.forEach(deal => {
      const probability = (deal.probability || 50) / 100;
      const stageWeight = stageWeights[deal.stage] || 0.5;
      const expectedValue = (deal.value || 0) * probability * stageWeight;

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      let key;

      if (period === 'month') {
        key = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'quarter') {
        const quarter = Math.floor(nextMonth.getMonth() / 3) + 1;
        key = `${nextMonth.getFullYear()}-Q${quarter}`;
      }

      if (!forecast[key]) {
        forecast[key] = { forecast: 0, count: 0 };
      }
      forecast[key].forecast += expectedValue;
      forecast[key].count += 1;
    });

    res.json({
      actual: timeline,
      forecast,
      period
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get forecast accuracy metrics
 * GET /api/forecasting/accuracy
 */
router.get('/accuracy', auth, async (req, res) => {
  try {
    // Get closed deals
    const closedDeals = await Deal.find({
      team: req.user.team,
      stage: { $in: ['won', 'lost'] },
      winDate: { $exists: true }
    });

    // Get current open deals
    const openDeals = await Deal.find({
      team: req.user.team,
      stage: { $ne: 'won', $ne: 'lost' }
    });

    const metrics = {
      totalDeals: closedDeals.length,
      winRate: 0,
      avgDealSize: 0,
      pipeline: 0,
      salesVelocity: 0,
      conversionByStage: {}
    };

    if (closedDeals.length > 0) {
      const wonDeals = closedDeals.filter(d => d.stage === 'won');
      metrics.winRate = ((wonDeals.length / closedDeals.length) * 100).toFixed(2);
      metrics.avgDealSize = (wonDeals.reduce((sum, d) => sum + (d.value || 0), 0) / wonDeals.length).toFixed(2);
    }

    // Calculate pipeline value with forecasting
    const stageWeights = {
      'lead': 0.1,
      'prospect': 0.25,
      'proposal': 0.50,
      'negotiation': 0.75
    };

    openDeals.forEach(deal => {
      const probability = (deal.probability || 50) / 100;
      const stageWeight = stageWeights[deal.stage] || 0.5;
      metrics.pipeline += (deal.value || 0) * probability * stageWeight;
    });

    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
