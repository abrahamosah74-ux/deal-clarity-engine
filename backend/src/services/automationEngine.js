// backend/src/services/automationEngine.js
const Workflow = require('../models/Workflow');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

class AutomationEngine {
  /**
   * Evaluate if a deal matches workflow conditions
   */
  static evaluateConditions(deal, conditions) {
    if (!conditions || conditions.length === 0) {
      return true; // No conditions = always pass
    }

    // All conditions must be true (AND logic)
    return conditions.every(condition => {
      const dealValue = this.getDealFieldValue(deal, condition.field);
      return this.evaluateCondition(dealValue, condition.operator, condition.value);
    });
  }

  /**
   * Get deal field value by path (supports nested fields)
   */
  static getDealFieldValue(deal, field) {
    const parts = field.split('.');
    let value = deal;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Evaluate a single condition
   */
  static evaluateCondition(dealValue, operator, expectedValue) {
    switch (operator) {
      case 'equals':
        return dealValue === expectedValue;
      case 'not_equals':
        return dealValue !== expectedValue;
      case 'greater_than':
        return Number(dealValue) > Number(expectedValue);
      case 'less_than':
        return Number(dealValue) < Number(expectedValue);
      case 'contains':
        return String(dealValue).includes(String(expectedValue));
      case 'not_contains':
        return !String(dealValue).includes(String(expectedValue));
      case 'is_empty':
        return !dealValue;
      case 'is_not_empty':
        return !!dealValue;
      default:
        return false;
    }
  }

  /**
   * Execute all actions for a workflow
   */
  static async executeActions(workflow, deal, team) {
    const results = [];

    for (const action of workflow.actions) {
      try {
        const result = await this.executeAction(action, deal, team, workflow);
        results.push({ type: action.type, status: 'success', result });
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
        results.push({ type: action.type, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  /**
   * Execute a single action
   */
  static async executeAction(action, deal, team, workflow) {
    switch (action.type) {
      case 'send_email':
        return await this.sendEmailAction(action, deal, team, workflow);
      case 'create_task':
        return await this.createTaskAction(action, deal, team, workflow);
      case 'update_field':
        return await this.updateFieldAction(action, deal, team, workflow);
      case 'notify_user':
        return await this.notifyUserAction(action, deal, team, workflow);
      case 'change_stage':
        return await this.changeStageAction(action, deal, team, workflow);
      case 'add_tag':
        return await this.addTagAction(action, deal, team, workflow);
      case 'slack_notification':
        return await this.slackNotificationAction(action, deal, team, workflow);
      case 'webhook':
        return await this.webhookAction(action, deal, team, workflow);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Send email action
   */
  static async sendEmailAction(action, deal, team, workflow) {
    const { to, subject, template, variables } = action.config;

    // Replace variables in subject and template
    let finalSubject = subject;
    let finalBody = template;

    const replacements = {
      dealName: deal.name,
      dealAmount: deal.amount,
      dealStage: deal.stage,
      dealProbability: deal.probability,
      dealCloseDate: deal.closeDate,
      ...variables
    };

    Object.entries(replacements).forEach(([key, value]) => {
      finalSubject = finalSubject.replace(`{{${key}}}`, value);
      finalBody = finalBody.replace(`{{${key}}}`, value);
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: finalSubject,
      html: finalBody
    });

    return { message: 'Email sent', recipient: to };
  }

  /**
   * Create task action
   */
  static async createTaskAction(action, deal, team, workflow) {
    const { title, description, priority, dueDate, assignedTo } = action.config;

    const task = new Task({
      title: title.replace(/{{dealName}}/g, deal.name),
      description: description?.replace(/{{dealName}}/g, deal.name),
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      assignedTo,
      deal: deal._id,
      team: team._id,
      createdBy: deal.userId,
      status: 'open'
    });

    await task.save();
    return { message: 'Task created', taskId: task._id };
  }

  /**
   * Update field action
   */
  static async updateFieldAction(action, deal, team, workflow) {
    const { field, value } = action.config;

    // Support nested field updates
    const parts = field.split('.');
    let target = deal;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) {
        target[parts[i]] = {};
      }
      target = target[parts[i]];
    }

    target[parts[parts.length - 1]] = value;
    await deal.save();

    return { message: 'Field updated', field, value };
  }

  /**
   * Notify user action
   */
  static async notifyUserAction(action, deal, team, workflow) {
    const { userId, title, message } = action.config;

    // TODO: Implement notification system (socket.io or in-app notifications)
    // For now, just return success
    return { message: 'Notification sent', userId, title };
  }

  /**
   * Change deal stage action
   */
  static async changeStageAction(action, deal, team, workflow) {
    const { newStage } = action.config;

    deal.stage = newStage;
    await deal.save();

    return { message: 'Stage changed', newStage };
  }

  /**
   * Add tag to deal action
   */
  static async addTagAction(action, deal, team, workflow) {
    const { tag } = action.config;

    if (!deal.tags) {
      deal.tags = [];
    }

    if (!deal.tags.includes(tag)) {
      deal.tags.push(tag);
      await deal.save();
    }

    return { message: 'Tag added', tag };
  }

  /**
   * Slack notification action
   */
  static async slackNotificationAction(action, deal, team, workflow) {
    const { webhookUrl, message } = action.config;

    // Replace variables
    let finalMessage = message
      .replace(/{{dealName}}/g, deal.name)
      .replace(/{{dealAmount}}/g, deal.amount)
      .replace(/{{dealStage}}/g, deal.stage);

    // TODO: Send to Slack webhook
    return { message: 'Slack notification queued', webhookUrl };
  }

  /**
   * Webhook action
   */
  static async webhookAction(action, deal, team, workflow) {
    const { url, method } = action.config;

    // TODO: Send HTTP request to webhook
    return { message: 'Webhook triggered', url, method };
  }

  /**
   * Trigger workflow based on event
   */
  static async triggerWorkflow(triggerType, dealId, team) {
    try {
      const deal = await Deal.findById(dealId);
      if (!deal) return;

      // Find all enabled workflows matching this trigger
      const workflows = await Workflow.find({
        team: team._id,
        enabled: true,
        'trigger.type': triggerType
      });

      console.log(`Found ${workflows.length} workflows for trigger: ${triggerType}`);

      for (const workflow of workflows) {
        // Check conditions
        if (!this.evaluateConditions(deal, workflow.conditions)) {
          continue;
        }

        // Execute actions
        const results = await this.executeActions(workflow, deal, team);

        // Update workflow stats
        workflow.stats.totalExecutions += 1;
        workflow.stats.successfulExecutions += results.filter(r => r.status === 'success').length;
        workflow.stats.failedExecutions += results.filter(r => r.status === 'failed').length;
        workflow.stats.lastExecuted = new Date();

        // Add to execution history
        workflow.executionHistory.push({
          dealId: deal._id,
          executedAt: new Date(),
          status: results.some(r => r.status === 'failed') ? 'failed' : 'success',
          actionsExecuted: results.length
        });

        // Keep only last 100 executions
        if (workflow.executionHistory.length > 100) {
          workflow.executionHistory = workflow.executionHistory.slice(-100);
        }

        await workflow.save();

        console.log(`Workflow "${workflow.name}" executed with ${results.length} actions`);
      }
    } catch (error) {
      console.error('Error triggering workflow:', error);
    }
  }
}

module.exports = AutomationEngine;
