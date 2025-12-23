const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');
const auth = require('../middleware/auth');

/**
 * Create email template
 */
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, subject, body, variables, tags } = req.body;

    const template = new EmailTemplate({
      team: req.user.team,
      createdBy: req.user._id,
      name,
      category,
      subject,
      body,
      variables: variables || [],
      tags: tags || []
    });

    await template.save();
    res.status(201).json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get all templates for team
 */
router.get('/', auth, async (req, res) => {
  try {
    const { category, isActive = true } = req.query;

    console.log('Fetching templates for team:', req.user.team);

    let query = { team: req.user.team };

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    console.log('Query:', query);

    const templates = await EmailTemplate.find(query)
      .sort({ category: 1, createdAt: -1 })
      .populate('createdBy', 'name avatar');

    console.log('Found templates:', templates.length);

    // Add default templates if none exist
    if (templates.length === 0) {
      try {
        console.log('Creating default templates...');
        const defaultTemplates = await createDefaultTemplates(req.user.team, req.user._id);
        console.log('Created default templates:', defaultTemplates.length);
        return res.json({ templates: defaultTemplates });
      } catch (defaultError) {
        console.error('Error creating default templates:', defaultError);
        // Return empty array instead of failing
        return res.json({ templates: [] });
      }
    }

    res.json({ templates });
  } catch (error) {
    console.error('GET /email-templates error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get single template
 */
router.get('/:templateId', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.templateId)
      .populate('createdBy', 'name avatar');

    if (!template || template.team.toString() !== req.user.team.toString()) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Update template
 */
router.patch('/:templateId', auth, async (req, res) => {
  try {
    const { name, subject, body, variables, tags, isActive } = req.body;

    let template = await EmailTemplate.findById(req.params.templateId);

    if (!template || template.team.toString() !== req.user.team.toString()) {
      return res.status(404).json({ message: 'Template not found' });
    }

    if (name) template.name = name;
    if (subject) template.subject = subject;
    if (body) template.body = body;
    if (variables) template.variables = variables;
    if (tags) template.tags = tags;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Delete template
 */
router.delete('/:templateId', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.templateId);

    if (!template || template.team.toString() !== req.user.team.toString()) {
      return res.status(404).json({ message: 'Template not found' });
    }

    await EmailTemplate.findByIdAndDelete(req.params.templateId);
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get template variables for preview/rendering
 */
router.post('/:templateId/render', auth, async (req, res) => {
  try {
    const { variables } = req.body;

    const template = await EmailTemplate.findById(req.params.templateId);

    if (!template || template.team.toString() !== req.user.team.toString()) {
      return res.status(404).json({ message: 'Template not found' });
    }

    let renderedBody = template.body;
    let renderedSubject = template.subject;

    // Replace variables with actual values
    Object.entries(variables || {}).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedBody = renderedBody.replace(regex, value);
      renderedSubject = renderedSubject.replace(regex, value);
    });

    res.json({
      template,
      rendered: {
        subject: renderedSubject,
        body: renderedBody
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Record template usage
 */
router.post('/:templateId/use', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.templateId,
      {
        $inc: { usageCount: 1 },
        lastUsedAt: new Date()
      },
      { new: true }
    );

    if (!template || template.team.toString() !== req.user.team.toString()) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Create default templates for new team
 */
async function createDefaultTemplates(teamId, userId) {
  const defaults = [
    {
      team: teamId,
      createdBy: userId,
      name: 'Follow-up After Meeting',
      category: 'follow_up',
      subject: 'Following up on our conversation',
      body: `Hi {{contactName}},

Thank you for taking the time to speak with me today about {{dealName}}. I really enjoyed our conversation about {{discussionTopic}}.

As discussed, the next steps are:
- {{nextStep1}}
- {{nextStep2}}

Please let me know if you have any questions. I'm looking forward to moving forward!

Best regards,
{{senderName}}`,
      variables: [
        { name: 'contactName', description: 'Contact first name', example: 'John' },
        { name: 'dealName', description: 'Deal name', example: 'Enterprise Package' },
        { name: 'discussionTopic', description: 'Main topic discussed', example: 'pricing and features' },
        { name: 'nextStep1', description: 'First next step', example: 'Send proposal by Friday' },
        { name: 'nextStep2', description: 'Second next step', example: 'Schedule follow-up call' },
        { name: 'senderName', description: 'Your name', example: 'Sarah' }
      ],
      isDefault: true
    },
    {
      team: teamId,
      createdBy: userId,
      name: 'Meeting Summary',
      category: 'meeting_summary',
      subject: 'Meeting Summary - {{dealName}}',
      body: `Hi {{contactName}},

Here's a summary of our meeting on {{meetingDate}}:

**What we discussed:**
- {{topic1}}
- {{topic2}}
- {{topic3}}

**Commitments:**
- {{commitment1}}
- {{commitment2}}

**Next meeting:** {{nextMeetingDate}}

Looking forward to our continued partnership!

Best regards,
{{senderName}}`,
      variables: [
        { name: 'contactName', description: 'Contact name', example: 'John Doe' },
        { name: 'dealName', description: 'Deal name', example: 'Q4 Enterprise Deal' },
        { name: 'meetingDate', description: 'Meeting date', example: 'December 15, 2024' },
        { name: 'topic1', description: 'First discussion topic', example: 'Implementation timeline' },
        { name: 'topic2', description: 'Second discussion topic', example: 'Pricing options' },
        { name: 'topic3', description: 'Third discussion topic', example: 'Support options' },
        { name: 'commitment1', description: 'Your commitment', example: 'Send proposal by Friday' },
        { name: 'commitment2', description: 'Their commitment', example: 'Review with team' },
        { name: 'nextMeetingDate', description: 'Next meeting date', example: 'December 22, 2024' },
        { name: 'senderName', description: 'Your name', example: 'Sarah' }
      ],
      isDefault: true
    },
    {
      team: teamId,
      createdBy: userId,
      name: 'Commitment Reminder',
      category: 'commitment_reminder',
      subject: 'Friendly reminder - {{commitmentDescription}}',
      body: `Hi {{contactName}},

I wanted to send a friendly reminder about the commitment we discussed:

**{{commitmentDescription}}**
Expected by: {{dueDate}}

If you have any questions or need anything from our end, please don't hesitate to reach out!

Best regards,
{{senderName}}`,
      variables: [
        { name: 'contactName', description: 'Contact name', example: 'John' },
        { name: 'commitmentDescription', description: 'What was committed', example: 'Review proposal' },
        { name: 'dueDate', description: 'Due date', example: 'December 20, 2024' },
        { name: 'senderName', description: 'Your name', example: 'Sarah' }
      ],
      isDefault: true
    },
    {
      team: teamId,
      createdBy: userId,
      name: 'Proposal Follow-up',
      category: 'proposal',
      subject: 'Proposal for {{dealName}} - {{companyName}}',
      body: `Hi {{contactName}},

Please find attached the proposal for {{dealName}} at {{companyName}}.

**Key highlights:**
- {{highlight1}}
- {{highlight2}}
- {{highlight3}}

We'd like to schedule a call to discuss this proposal. Are you available on {{proposedDate}}?

Looking forward to partnering with you!

Best regards,
{{senderName}}
{{senderTitle}}`,
      variables: [
        { name: 'contactName', description: 'Contact name', example: 'John' },
        { name: 'dealName', description: 'Deal name', example: 'Enterprise License' },
        { name: 'companyName', description: 'Company name', example: 'Acme Corp' },
        { name: 'highlight1', description: 'First proposal highlight', example: 'Unlimited user licenses' },
        { name: 'highlight2', description: 'Second proposal highlight', example: '24/7 support included' },
        { name: 'highlight3', description: 'Third proposal highlight', example: 'Custom integrations' },
        { name: 'proposedDate', description: 'Proposed meeting date', example: 'December 22, 2024' },
        { name: 'senderName', description: 'Your name', example: 'Sarah' },
        { name: 'senderTitle', description: 'Your title', example: 'Sales Director' }
      ],
      isDefault: true
    }
  ];

  try {
    // Check if any templates already exist before inserting
    const existingCount = await EmailTemplate.countDocuments({ team: teamId, isDefault: true });
    if (existingCount > 0) {
      // Return existing templates instead of creating duplicates
      return await EmailTemplate.find({ team: teamId, isDefault: true });
    }

    return await EmailTemplate.insertMany(defaults);
  } catch (error) {
    console.error('Error in createDefaultTemplates:', error);
    // Return any existing default templates instead of failing
    return await EmailTemplate.find({ team: teamId, isDefault: true }).catch(() => []);
  }
}

module.exports = router;
