// backend/src/routes/automations.js
const express = require('express');
const router = express.Router();
const Workflow = require('../models/Workflow');
const Deal = require('../models/Deal');
const auth = require('../middleware/auth');
const { checkFeatureAccess } = require('../middleware/featureAccess');
const AutomationEngine = require('../services/automationEngine');

// Middleware to check team access
const checkTeamAccess = async (req, res, next) => {
  try {
    const workflow = await Workflow.findById(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    // Check if user belongs to this team
    const user = await req.user;
    if (!user.teams.includes(workflow.team.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.workflow = workflow;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new workflow
 */
router.post('/', auth, checkFeatureAccess('automations'), async (req, res) => {
  try {
    const { name, description, team, trigger, conditions, actions } = req.body;

    if (!name || !trigger) {
      return res.status(400).json({ message: 'Name and trigger are required' });
    }

    const workflow = new Workflow({
      name: name.trim(),
      description,
      team,
      trigger,
      conditions: conditions || [],
      actions: actions || [],
      createdBy: req.user.id
    });

    await workflow.save();

    res.status(201).json({
      message: 'Workflow created successfully',
      workflow
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get all workflows for a team
 */
router.get('/team/:teamId', auth, async (req, res) => {
  try {
    const workflows = await Workflow.find({ team: req.params.teamId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get single workflow
 */
router.get('/:workflowId', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.workflowId)
      .populate('createdBy', 'name email');

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Update workflow
 */
router.put('/:workflowId', auth, checkTeamAccess, async (req, res) => {
  try {
    const { name, description, enabled, trigger, conditions, actions } = req.body;

    if (name) req.workflow.name = name.trim();
    if (description !== undefined) req.workflow.description = description;
    if (enabled !== undefined) req.workflow.enabled = enabled;
    if (trigger) req.workflow.trigger = trigger;
    if (conditions) req.workflow.conditions = conditions;
    if (actions) req.workflow.actions = actions;

    await req.workflow.save();

    res.json({
      message: 'Workflow updated successfully',
      workflow: req.workflow
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Delete workflow
 */
router.delete('/:workflowId', auth, checkTeamAccess, async (req, res) => {
  try {
    await Workflow.findByIdAndDelete(req.params.workflowId);

    res.json({ message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Toggle workflow enabled/disabled
 */
router.patch('/:workflowId/toggle', auth, checkTeamAccess, async (req, res) => {
  try {
    req.workflow.enabled = !req.workflow.enabled;
    await req.workflow.save();

    res.json({
      message: `Workflow ${req.workflow.enabled ? 'enabled' : 'disabled'}`,
      workflow: req.workflow
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get workflow execution history
 */
router.get('/:workflowId/history', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.workflowId);

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const history = workflow.executionHistory.slice(-limit).reverse();

    res.json({
      history,
      stats: workflow.stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Manually trigger workflow on a deal
 */
router.post('/:workflowId/execute/:dealId', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    const deal = await Deal.findById(req.params.dealId);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    // Execute the workflow manually
    if (!AutomationEngine.evaluateConditions(deal, workflow.conditions)) {
      return res.status(400).json({ message: 'Deal does not meet workflow conditions' });
    }

    const results = await AutomationEngine.executeActions(workflow, deal, workflow.team);

    // Update stats
    workflow.stats.totalExecutions += 1;
    workflow.stats.successfulExecutions += results.filter(r => r.status === 'success').length;
    workflow.stats.failedExecutions += results.filter(r => r.status === 'failed').length;
    workflow.stats.lastExecuted = new Date();

    workflow.executionHistory.push({
      dealId: deal._id,
      executedAt: new Date(),
      status: results.some(r => r.status === 'failed') ? 'failed' : 'success',
      actionsExecuted: results.length
    });

    if (workflow.executionHistory.length > 100) {
      workflow.executionHistory = workflow.executionHistory.slice(-100);
    }

    await workflow.save();

    res.json({
      message: 'Workflow executed successfully',
      results
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get available trigger types
 */
router.get('/available/triggers', (req, res) => {
  res.json({
    triggers: [
      {
        id: 'deal_created',
        name: 'Deal Created',
        description: 'Triggers when a new deal is created'
      },
      {
        id: 'deal_updated',
        name: 'Deal Updated',
        description: 'Triggers when a deal is updated'
      },
      {
        id: 'deal_stage_changed',
        name: 'Deal Stage Changed',
        description: 'Triggers when deal stage changes',
        config: {
          fromStage: { type: 'select', options: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] },
          toStage: { type: 'select', options: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] }
        }
      },
      {
        id: 'deal_amount_changed',
        name: 'Deal Amount Changed',
        description: 'Triggers when deal amount changes'
      },
      {
        id: 'deal_closed',
        name: 'Deal Closed',
        description: 'Triggers when deal is won or lost'
      },
      {
        id: 'deal_days_in_stage',
        name: 'Deal Days In Stage',
        description: 'Triggers after X days in current stage',
        config: {
          days: { type: 'number' }
        }
      }
    ]
  });
});

/**
 * Get available actions
 */
router.get('/available/actions', (req, res) => {
  res.json({
    actions: [
      {
        id: 'send_email',
        name: 'Send Email',
        description: 'Send email notification',
        config: {
          to: { type: 'text', required: true },
          subject: { type: 'text', required: true },
          template: { type: 'textarea', required: true, help: 'Use {{dealName}}, {{dealAmount}}, {{dealStage}}' }
        }
      },
      {
        id: 'create_task',
        name: 'Create Task',
        description: 'Create a task automatically',
        config: {
          title: { type: 'text', required: true },
          description: { type: 'textarea' },
          priority: { type: 'select', options: ['low', 'medium', 'high'] },
          dueDate: { type: 'date' }
        }
      },
      {
        id: 'update_field',
        name: 'Update Field',
        description: 'Update a deal field',
        config: {
          field: { type: 'text', required: true, help: 'e.g., stage, probability, amount' },
          value: { type: 'text', required: true }
        }
      },
      {
        id: 'change_stage',
        name: 'Change Deal Stage',
        description: 'Automatically advance deal stage',
        config: {
          newStage: { type: 'select', options: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] }
        }
      },
      {
        id: 'add_tag',
        name: 'Add Tag',
        description: 'Add a tag to the deal',
        config: {
          tag: { type: 'text', required: true }
        }
      },
      {
        id: 'notify_user',
        name: 'Notify User',
        description: 'Send in-app notification',
        config: {
          userId: { type: 'text', required: true },
          title: { type: 'text', required: true },
          message: { type: 'textarea', required: true }
        }
      }
    ]
  });
});

module.exports = router;
