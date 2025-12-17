// frontend/src/services/notificationTrigger.js
import { api } from './api';

export const notificationService = {
  /**
   * Trigger a deal created notification
   */
  notifyDealCreated: async (dealData, teamId) => {
    try {
      await api.post('/notifications/create', {
        type: 'deal_created',
        title: `New Deal: ${dealData.title}`,
        message: `${dealData.title} - ${dealData.value ? `$${dealData.value}` : 'No value set'}`,
        teamId,
        link: {
          resource: 'deal',
          resourceId: dealData._id
        },
        priority: 'medium'
      });
    } catch (error) {
      console.error('Failed to send deal created notification:', error);
    }
  },

  /**
   * Trigger a deal stage changed notification
   */
  notifyDealStageChanged: async (dealData, previousStage, newStage, teamId) => {
    try {
      await api.post('/notifications/create', {
        type: 'deal_stage_changed',
        title: `Deal Stage Updated: ${dealData.title}`,
        message: `Moved from ${previousStage} to ${newStage}`,
        teamId,
        link: {
          resource: 'deal',
          resourceId: dealData._id
        },
        priority: 'medium'
      });
    } catch (error) {
      console.error('Failed to send deal stage changed notification:', error);
    }
  },

  /**
   * Trigger a task assigned notification
   */
  notifyTaskAssigned: async (taskData, assigneeId, teamId) => {
    try {
      await api.post('/notifications/create', {
        type: 'task_assigned',
        title: `Task Assigned: ${taskData.title}`,
        message: `${taskData.title} has been assigned to you`,
        recipient: assigneeId,
        teamId,
        link: {
          resource: 'task',
          resourceId: taskData._id
        },
        priority: 'high'
      });
    } catch (error) {
      console.error('Failed to send task assigned notification:', error);
    }
  },

  /**
   * Trigger a workflow executed notification
   */
  notifyWorkflowExecuted: async (workflowData, teamId, details) => {
    try {
      await api.post('/notifications/create', {
        type: 'workflow_executed',
        title: `Automation Executed: ${workflowData.name}`,
        message: details || `${workflowData.name} was triggered`,
        teamId,
        link: {
          resource: 'workflow',
          resourceId: workflowData._id
        },
        priority: 'low'
      });
    } catch (error) {
      console.error('Failed to send workflow executed notification:', error);
    }
  },

  /**
   * Trigger a team member added notification
   */
  notifyTeamMemberAdded: async (memberData, teamId, teamName) => {
    try {
      await api.post('/notifications/create', {
        type: 'team_member_added',
        title: `Team Member Added: ${memberData.firstName} ${memberData.lastName}`,
        message: `${memberData.firstName} has been added to ${teamName}`,
        recipient: memberData._id,
        teamId,
        priority: 'high'
      });
    } catch (error) {
      console.error('Failed to send team member added notification:', error);
    }
  },

  /**
   * Trigger a custom notification
   */
  notifyCustom: async (title, message, teamId, recipientId = null, priority = 'medium') => {
    try {
      await api.post('/notifications/create', {
        type: 'custom',
        title,
        message,
        teamId,
        ...(recipientId && { recipient: recipientId }),
        priority
      });
    } catch (error) {
      console.error('Failed to send custom notification:', error);
    }
  }
};
