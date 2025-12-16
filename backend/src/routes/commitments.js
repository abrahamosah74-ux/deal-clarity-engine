// backend/src/routes/commitments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Commitment = require('../models/Commitment');
const { syncToCRM } = require('../utils/crmSync');
const { sendFollowUpEmail } = require('../utils/emailService');

// Create new commitment (post-call)
router.post('/', auth, async (req, res) => {
  try {
    const {
      calendarEventId,
      meetingTitle,
      participants,
      ourCommitments,
      theirCommitments,
      meetingDate,
      dealId,
      notes
    } = req.body;
    
    // Calculate clarity score
    const clarityScore = calculateClarityScore(ourCommitments, theirCommitments);
    
    // Create commitment
    const commitment = new Commitment({
      userId: req.user.id,
      calendarEventId,
      meetingTitle,
      participants,
      ourCommitments: ourCommitments.map(c => ({
        ...c,
        owner: c.owner || req.user.email
      })),
      theirCommitments: theirCommitments.map(c => ({
        ...c,
        status: c.dueDate ? 'pending' : 'non-committal'
      })),
      meetingDate: meetingDate || new Date(),
      dealId,
      clarityScore,
      notes
    });
    
    await commitment.save();
    
    // Sync to CRM if dealId is provided
    let crmSyncResult = null;
    if (dealId && req.user.integrations?.crm?.provider) {
      crmSyncResult = await syncToCRM(req.user, commitment);
      commitment.crmSync = {
        synced: crmSyncResult.success,
        syncedAt: new Date(),
        fieldUpdated: crmSyncResult.field,
        error: crmSyncResult.error
      };
      await commitment.save();
    }
    
    // Generate follow-up email
    const emailResult = await generateFollowUpEmail(req.user, commitment);
    
    res.json({
      success: true,
      commitmentId: commitment._id,
      clarityScore,
      emailPreview: emailResult.preview,
      crmSync: crmSyncResult,
      undoToken: generateUndoToken(commitment._id)
    });
  } catch (error) {
    console.error('Commitment creation error:', error);
    res.status(500).json({ error: 'Failed to save commitments' });
  }
});

// Send follow-up email
router.post('/:id/send-email', auth, async (req, res) => {
  try {
    const commitment = await Commitment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!commitment) {
      return res.status(404).json({ error: 'Commitment not found' });
    }
    
    const { to, subject, body } = req.body;
    
    // Send email
    const emailResult = await sendFollowUpEmail(req.user, {
      to,
      subject: subject || `Following up on our call - ${commitment.meetingTitle}`,
      body,
      commitmentId: commitment._id
    });
    
    // Update commitment
    commitment.followUpEmail = {
      sent: true,
      sentAt: new Date(),
      emailId: emailResult.messageId,
      subject: subject,
      body: body
    };
    
    await commitment.save();
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      messageId: emailResult.messageId,
      undoToken: generateUndoToken(commitment._id)
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Undo last action
router.post('/:id/undo', auth, async (req, res) => {
  try {
    const { token, action } = req.body;
    
    // Verify undo token
    if (!verifyUndoToken(req.params.id, token)) {
      return res.status(400).json({ error: 'Invalid undo token' });
    }
    
    const commitment = await Commitment.findById(req.params.id);
    
    if (action === 'email') {
      // Mark email as not sent (note: we can't actually unsend)
      commitment.followUpEmail.sent = false;
      await commitment.save();
      
      res.json({ success: true, message: 'Email marked as not sent' });
    } else if (action === 'crm') {
      // Revert CRM sync
      const revertResult = await revertCRMSync(req.user, commitment);
      commitment.crmSync.synced = false;
      await commitment.save();
      
      res.json({ 
        success: true, 
        message: 'CRM sync reverted',
        details: revertResult 
      });
    }
  } catch (error) {
    console.error('Undo error:', error);
    res.status(500).json({ error: 'Undo failed' });
  }
});

// Helper functions
function calculateClarityScore(ourCommitments, theirCommitments) {
  let score = 0;
  
  // Check our commitments
  ourCommitments.forEach(c => {
    if (c.action && c.action.length > 5) score += 25;
    if (c.dueDate) score += 25;
  });
  
  // Check their commitments
  theirCommitments.forEach(c => {
    if (c.action && c.action.length > 5) score += 25;
    if (c.dueDate) score += 25;
  });
  
  return score;
}

function generateUndoToken(commitmentId) {
  return Buffer.from(`${commitmentId}:${Date.now()}`).toString('base64');
}

function verifyUndoToken(commitmentId, token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('ascii');
    const [id, timestamp] = decoded.split(':');
    return id === commitmentId && Date.now() - parseInt(timestamp) < 10 * 60 * 1000; // 10 minutes
  } catch (error) {
    return false;
  }
}

async function generateFollowUpEmail(user, commitment) {
  const ourActions = commitment.ourCommitments.map(c => 
    `• I'll ${c.action} by ${new Date(c.dueDate).toLocaleDateString()}`
  ).join('\n');
  
  const theirActions = commitment.theirCommitments.map(c => 
    `• You'll ${c.action} by ${new Date(c.dueDate).toLocaleDateString()}`
  ).join('\n');
  
  const template = `Hi ${commitment.participants[0]?.name || 'there'},

Great conversation earlier. To keep momentum:

${ourActions}

${theirActions}

Let me know if anything changes.

Best,
${user.name}`;

  return { preview: template };
}

// Get commitment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get commitments from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const commitments = await Commitment.find({
      userId,
      meetingDate: { $gte: thirtyDaysAgo }
    });
    
    // Calculate stats
    const totalCalls = commitments.length;
    
    // Average follow-up time (in minutes)
    let totalFollowUpTime = 0;
    let followUpCount = 0;
    
    commitments.forEach(c => {
      if (c.followUpEmail?.sentAt && c.meetingDate) {
        const followUpTime = (c.followUpEmail.sentAt - c.meetingDate) / (1000 * 60); // minutes
        totalFollowUpTime += followUpTime;
        followUpCount++;
      }
    });
    
    const avgFollowUpTime = followUpCount > 0 ? Math.round(totalFollowUpTime / followUpCount) : 0;
    
    // Average clarity score
    const totalClarity = commitments.reduce((sum, c) => sum + (c.clarityScore || 0), 0);
    const avgClarityScore = totalCalls > 0 ? Math.round(totalClarity / totalCalls) : 0;
    
    // Commitment rate (% of calls with mutual commitments)
    const callsWithMutualCommitments = commitments.filter(c => 
      c.theirCommitments && c.theirCommitments.length > 0
    ).length;
    
    const commitmentRate = totalCalls > 0 
      ? Math.round((callsWithMutualCommitments / totalCalls) * 100)
      : 0;
    
    // Deals advanced (calls with clarity score > 80%)
    const dealsAdvanced = commitments.filter(c => (c.clarityScore || 0) >= 80).length;
    
    // Overdue commitments
    const now = new Date();
    const overdueCommitments = commitments.reduce((count, c) => {
      const ourOverdue = c.ourCommitments.filter(oc => 
        !oc.completed && oc.dueDate && new Date(oc.dueDate) < now
      ).length;
      
      const theirOverdue = c.theirCommitments.filter(tc => 
        tc.status === 'pending' && tc.dueDate && new Date(tc.dueDate) < now
      ).length;
      
      return count + ourOverdue + theirOverdue;
    }, 0);
    
    res.json({
      totalCalls,
      avgFollowUpTime,
      clarityScore: avgClarityScore,
      commitmentRate,
      dealsAdvanced,
      overdueCommitments
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get recent calls
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const commitments = await Commitment.find({
      userId: req.user.id
    })
    .sort({ meetingDate: -1 })
    .limit(limit)
    .lean();
    
    const formattedCalls = commitments.map(c => {
      const prospect = c.participants?.find(p => p.email !== req.user.email) || c.participants?.[0];
      
      // Calculate follow-up time in minutes
      let followUpTime = null;
      if (c.followUpEmail?.sentAt && c.meetingDate) {
        followUpTime = Math.round((c.followUpEmail.sentAt - c.meetingDate) / (1000 * 60));
      }
      
      return {
        id: c._id,
        prospectName: prospect?.name || 'Unknown',
        company: prospect?.company || '',
        date: c.meetingDate,
        followUpTime,
        clarityScore: c.clarityScore || 0,
        status: c.theirCommitments?.length > 0 ? 'completed' : 'pending'
      };
    });
    
    res.json(formattedCalls);
  } catch (error) {
    console.error('Recent calls error:', error);
    res.status(500).json({ error: 'Failed to fetch recent calls' });
  }
});
module.exports = router;