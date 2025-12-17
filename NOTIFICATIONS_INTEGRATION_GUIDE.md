# How to Integrate Notifications into Components

## Quick Start - 3 Simple Steps

### Step 1: Import the Trigger Service
```javascript
import { notificationService } from '../services/notificationTrigger';
```

### Step 2: Call When Action Occurs
```javascript
// Example: When creating a deal
const createDeal = async (dealData) => {
  // ... your creation logic
  const newDeal = await api.post('/deals', dealData);
  
  // Trigger notification
  await notificationService.notifyDealCreated(newDeal, userTeamId);
};
```

### Step 3: Done! 🎉
The notification will automatically:
- ✅ Appear in the NotificationCenter bell
- ✅ Broadcast to team via Socket.io
- ✅ Persist to database
- ✅ Show browser notification (if permitted)

---

## Integration Examples

### Example 1: Deal Creation (Kanban Component)

**File:** `frontend/src/pages/Kanban.js`

```javascript
import { notificationService } from '../services/notificationTrigger';

const handleCreateDeal = async (dealData) => {
  try {
    const response = await api.post('/deals', dealData);
    const newDeal = response.data;
    
    // Add notification
    await notificationService.notifyDealCreated(
      newDeal,
      userTeamId  // Your team ID
    );
    
    // Update UI
    setDeals(prev => [...prev, newDeal]);
  } catch (error) {
    console.error('Failed to create deal:', error);
  }
};
```

### Example 2: Deal Stage Change

**File:** `frontend/src/pages/Kanban.js`

```javascript
const handleDragEnd = async (source, destination, draggableId) => {
  try {
    const previousStage = source.droppableId;
    const newStage = destination.droppableId;
    const dealId = draggableId;
    
    // Update on backend
    const response = await api.patch(`/deals/${dealId}`, {
      stage: newStage
    });
    
    const updatedDeal = response.data;
    
    // Notify team of stage change
    await notificationService.notifyDealStageChanged(
      updatedDeal,
      previousStage,
      newStage,
      userTeamId
    );
    
    // Update UI
    updateDealInList(dealId, updatedDeal);
  } catch (error) {
    console.error('Failed to update deal:', error);
  }
};
```

### Example 3: Task Assignment

**File:** `frontend/src/pages/Tasks.js`

```javascript
const handleAssignTask = async (taskId, assigneeId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}`, {
      assignedTo: assigneeId
    });
    
    const updatedTask = response.data;
    
    // Notify assignee
    await notificationService.notifyTaskAssigned(
      updatedTask,
      assigneeId,
      userTeamId
    );
    
    // Update UI
    updateTaskInList(taskId, updatedTask);
  } catch (error) {
    console.error('Failed to assign task:', error);
  }
};
```

### Example 4: Workflow Execution

**File:** `frontend/src/components/Automations.js`

```javascript
const handleExecuteWorkflow = async (workflowId) => {
  try {
    const response = await api.post(`/automations/${workflowId}/execute`);
    const result = response.data;
    
    // Notify team of automation execution
    await notificationService.notifyWorkflowExecuted(
      { _id: workflowId, name: workflowName },
      userTeamId,
      `Workflow executed with ${result.affectedDeals} deals updated`
    );
    
    // Show result
    showSuccessMessage(`Workflow executed successfully`);
  } catch (error) {
    console.error('Failed to execute workflow:', error);
  }
};
```

### Example 5: Team Member Added (Settings)

**File:** `frontend/src/pages/Settings.js` or Team management component

```javascript
const handleAddTeamMember = async (memberEmail) => {
  try {
    const response = await api.post('/teams/members/invite', {
      email: memberEmail
    });
    
    const newMember = response.data.member;
    
    // Notify new member
    await notificationService.notifyTeamMemberAdded(
      newMember,
      userTeamId,
      teamName
    );
    
    // Update UI
    setTeamMembers(prev => [...prev, newMember]);
  } catch (error) {
    console.error('Failed to add team member:', error);
  }
};
```

### Example 6: Custom Notification

```javascript
// For any other event
await notificationService.notifyCustom(
  'Custom Event Title',
  'Custom event description message',
  userTeamId,
  recipientId,  // Optional - if specific user
  'high'        // Optional - priority level
);
```

---

## Notification Service API Reference

### `notifyDealCreated(dealData, teamId)`
- **Params:**
  - `dealData` - Deal object with `_id`, `title`, `value`
  - `teamId` - Team ID for broadcast
- **Type:** `deal_created`
- **Priority:** Medium

### `notifyDealStageChanged(dealData, previousStage, newStage, teamId)`
- **Params:**
  - `dealData` - Deal object
  - `previousStage` - Previous stage name
  - `newStage` - New stage name
  - `teamId` - Team ID
- **Type:** `deal_stage_changed`
- **Priority:** Medium

### `notifyTaskAssigned(taskData, assigneeId, teamId)`
- **Params:**
  - `taskData` - Task object with `_id`, `title`
  - `assigneeId` - User to notify
  - `teamId` - Team ID
- **Type:** `task_assigned`
- **Priority:** High

### `notifyWorkflowExecuted(workflowData, teamId, details)`
- **Params:**
  - `workflowData` - Workflow object with `_id`, `name`
  - `teamId` - Team ID
  - `details` - Optional execution details
- **Type:** `workflow_executed`
- **Priority:** Low

### `notifyTeamMemberAdded(memberData, teamId, teamName)`
- **Params:**
  - `memberData` - Member object with `_id`, `firstName`, `lastName`
  - `teamId` - Team ID
  - `teamName` - Team display name
- **Type:** `team_member_added`
- **Priority:** High

### `notifyCustom(title, message, teamId, recipientId?, priority?)`
- **Params:**
  - `title` - Notification title
  - `message` - Notification message
  - `teamId` - Team ID
  - `recipientId` - Optional specific user ID
  - `priority` - Optional 'low', 'medium', 'high' (default: 'medium')
- **Type:** `custom`

---

## Important Notes

### User Context
Make sure your components have access to the user's:
- `userId` - Available from `useAuth()` hook as `user._id`
- `teamId` - Available from `useAuth()` hook as `user.team`

Example:
```javascript
import { useAuth } from '../contexts/AuthContext';

function YourComponent() {
  const { user } = useAuth();
  const userTeamId = user?.team;  // Use this for teamId parameter
}
```

### Error Handling
Notifications are fire-and-forget. If creation fails:
```javascript
try {
  // Your action
  await notificationService.notify...();
} catch (error) {
  console.error('Notification failed (non-blocking):', error);
  // Main action succeeded, notification just failed
}
```

### Real-Time Updates
All notifications are broadcast via Socket.io in real-time:
- ✅ User creating notification sees it immediately
- ✅ All team members receive it via WebSocket (no refresh needed)
- ✅ Mobile browser support (polling fallback)
- ✅ Automatic reconnection on disconnect

### Testing in Development
1. Open browser DevTools → Network tab
2. Filter for `socket.io` connections
3. Create an action that triggers a notification
4. Watch the WebSocket message in Network tab
5. Check NotificationCenter component updates

---

## Integration Checklist

For each component you integrate:
- [ ] Import `notificationService`
- [ ] Import `useAuth` for user context
- [ ] After action succeeds, call `notifyXXX()`
- [ ] Pass correct parameters
- [ ] Handle errors gracefully
- [ ] Test in development
- [ ] Test in production
- [ ] Verify Socket.io message in DevTools

---

## Common Mistakes to Avoid

❌ **DON'T:**
```javascript
// Calling before action completes
await notificationService.notifyDealCreated(...);
await api.post('/deals', dealData);  // Too late!
```

✅ **DO:**
```javascript
// Call after action completes successfully
const response = await api.post('/deals', dealData);
await notificationService.notifyDealCreated(response.data, teamId);
```

---

❌ **DON'T:**
```javascript
// Forgetting to await
notificationService.notifyDealCreated(...);  // Fire-and-forget is OK but be aware
```

✅ **DO:**
```javascript
// Either await or use .catch()
await notificationService.notifyDealCreated(...);
// OR
notificationService.notifyDealCreated(...).catch(e => console.error(e));
```

---

That's it! Start integrating notifications into your components and watch them light up with real-time updates! 🚀

For questions or issues, check the `NOTIFICATIONS_IMPLEMENTATION.md` for detailed architecture documentation.
