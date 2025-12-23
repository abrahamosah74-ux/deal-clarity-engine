// Email template presets that users can choose from
export const emailTemplatePresets = [
  {
    id: 'follow_up_1',
    name: 'Quick Follow-up',
    category: 'follow_up',
    subject: 'Following up on {{dealName}}',
    body: `Hi {{contactName}},

I hope this email finds you well! I wanted to follow up on {{dealName}} that we discussed on {{meetingDate}}.

I believe this solution can help {{companyName}} achieve {{goal}}, and I'd love to discuss how we can move forward together.

Would you be available for a brief call next week?

Best regards,
{{senderName}}
{{senderTitle}}
{{companyName}}
{{contactPhone}}
{{contactEmail}}`,
    variables: [
      { name: 'contactName', description: 'Contact Name', example: 'John' },
      { name: 'dealName', description: 'Deal/Project Name', example: 'CRM Implementation' },
      { name: 'meetingDate', description: 'Meeting Date', example: 'January 15, 2025' },
      { name: 'companyName', description: 'Company Name', example: 'Acme Corp' },
      { name: 'goal', description: 'Business Goal', example: 'improve sales efficiency' },
      { name: 'senderName', description: 'Your Name', example: 'Sarah Johnson' },
      { name: 'senderTitle', description: 'Your Title', example: 'Sales Manager' }
    ],
    tags: ['followup', 'short', 'professional'],
    usageCount: 0
  },
  {
    id: 'meeting_summary_1',
    name: 'Meeting Summary & Next Steps',
    category: 'meeting_summary',
    subject: 'Meeting Summary - {{dealName}}',
    body: `Hi {{contactName}},

Thank you for taking the time to meet with us on {{meetingDate}}. It was great to learn more about {{companyName}}'s needs and goals.

Here's a summary of what we discussed:
• {{topic1}}
• {{topic2}}
• {{topic3}}

Next Steps:
1. {{action1}} - by {{date1}}
2. {{action2}} - by {{date2}}
3. {{action3}} - by {{date3}}

Please let me know if you have any questions or would like to discuss anything further. I'm excited about the potential opportunity here!

Looking forward to our next conversation.

Best regards,
{{senderName}}`,
    variables: [
      { name: 'contactName', description: 'Contact Name', example: 'Jane Smith' },
      { name: 'dealName', description: 'Deal Name', example: 'Marketing Automation' },
      { name: 'meetingDate', description: 'Meeting Date', example: 'January 18, 2025' },
      { name: 'companyName', description: 'Company Name', example: 'Tech Solutions Inc' },
      { name: 'topic1', description: 'Discussion Topic 1', example: 'Current marketing challenges' },
      { name: 'topic2', description: 'Discussion Topic 2', example: 'Budget and timeline' },
      { name: 'topic3', description: 'Discussion Topic 3', example: 'Implementation process' },
      { name: 'action1', description: 'Action Item 1', example: 'Send proposal' },
      { name: 'date1', description: 'Deadline 1', example: 'January 22' },
      { name: 'action2', description: 'Action Item 2', example: 'Schedule demo' },
      { name: 'date2', description: 'Deadline 2', example: 'January 25' },
      { name: 'action3', description: 'Action Item 3', example: 'Discuss pricing' },
      { name: 'date3', description: 'Deadline 3', example: 'January 29' },
      { name: 'senderName', description: 'Your Name', example: 'Mike Johnson' }
    ],
    tags: ['meeting', 'summary', 'professional', 'detailed'],
    usageCount: 0
  },
  {
    id: 'commitment_reminder_1',
    name: 'Commitment Reminder',
    category: 'commitment_reminder',
    subject: 'Reminder: {{commitment}} - Due {{dueDate}}',
    body: `Hi {{contactName}},

I wanted to send you a friendly reminder about the commitment we made regarding {{commitment}}.

As per our discussion, this was scheduled for {{dueDate}}. 

{{currentStatus}}

If there are any obstacles or if the timeline has changed, please let me know as soon as possible so we can adjust our plan accordingly.

{{additionalNotes}}

Looking forward to moving forward with this!

Best regards,
{{senderName}}
{{senderCompany}}`,
    variables: [
      { name: 'contactName', description: 'Contact Name', example: 'Robert Davis' },
      { name: 'commitment', description: 'The Commitment', example: 'sending budget approval' },
      { name: 'dueDate', description: 'Due Date', example: 'January 25, 2025' },
      { name: 'currentStatus', description: 'Current Status', example: 'We are on track for delivery next week.' },
      { name: 'additionalNotes', description: 'Additional Notes', example: 'I\'ve attached the latest cost breakdown for your review.' },
      { name: 'senderName', description: 'Your Name', example: 'Lisa Chen' },
      { name: 'senderCompany', description: 'Company Name', example: 'Clarity Solutions' }
    ],
    tags: ['reminder', 'commitment', 'followup'],
    usageCount: 0
  },
  {
    id: 'proposal_introduction_1',
    name: 'Proposal Introduction',
    category: 'proposal',
    subject: 'Your {{dealName}} Proposal - {{companyName}}',
    body: `Hi {{contactName}},

I'm excited to share the proposal for {{dealName}} with you and the {{companyName}} team!

Based on our conversations and your specific requirements, we've tailored a solution that includes:

✓ {{feature1}}
✓ {{feature2}}
✓ {{feature3}}

Investment: {{investmentAmount}} ({{paymentTerms}})
Timeline: {{timeline}}

This proposal is designed to address your {{mainPain}} and deliver {{expectedBenefit}} within {{timeframe}}.

I've attached the detailed proposal document. Please review it at your convenience, and let's schedule a call to discuss any questions you might have.

I'm available {{availableTime}}.

Best regards,
{{senderName}}
{{senderTitle}}
{{senderContact}}`,
    variables: [
      { name: 'contactName', description: 'Contact Name', example: 'Andrew Mitchell' },
      { name: 'dealName', description: 'Deal/Service Name', example: 'Enterprise Analytics Platform' },
      { name: 'companyName', description: 'Company Name', example: 'Global Enterprises' },
      { name: 'feature1', description: 'Feature 1', example: 'Real-time reporting dashboard' },
      { name: 'feature2', description: 'Feature 2', example: 'Predictive analytics' },
      { name: 'feature3', description: 'Feature 3', example: '24/7 dedicated support' },
      { name: 'investmentAmount', description: 'Price/Cost', example: '$45,000' },
      { name: 'paymentTerms', description: 'Payment Terms', example: 'quarterly billing' },
      { name: 'timeline', description: 'Implementation Timeline', example: '90 days' },
      { name: 'mainPain', description: 'Main Pain Point', example: 'data silos and reporting delays' },
      { name: 'expectedBenefit', description: 'Expected Benefit', example: 'a 40% improvement in decision-making speed' },
      { name: 'timeframe', description: 'Timeframe', example: '6 months' },
      { name: 'availableTime', description: 'Available Times', example: 'Tuesday or Wednesday next week' },
      { name: 'senderName', description: 'Your Name', example: 'Emma Wilson' },
      { name: 'senderTitle', description: 'Your Title', example: 'Account Executive' },
      { name: 'senderContact', description: 'Your Contact', example: 'emma@dealsolutions.com | 555-123-4567' }
    ],
    tags: ['proposal', 'sales', 'formal'],
    usageCount: 0
  },
  {
    id: 'closing_request_1',
    name: 'Closing Request',
    category: 'closing',
    subject: 'Ready to Move Forward with {{dealName}}?',
    body: `Hi {{contactName}},

We've had great conversations about {{dealName}}, and I can see how our solution will create significant value for {{companyName}}.

Here's where we stand:
• You've approved the scope and timeline ✓
• {{stakeholder}} has signed off on the budget ✓
• We've addressed all technical concerns ✓

The only remaining step is to execute the agreement. I've prepared everything for a smooth onboarding process.

Would you be available for a quick call on {{proposedDate}} to finalize the contract? We can then get started immediately on {{startDate}}.

{{urgencyMessage}}

I'm confident this partnership will deliver the {{expectedResult}} we discussed.

Looking forward to working with you!

Best regards,
{{senderName}}
{{senderTitle}}
{{contactInfo}}`,
    variables: [
      { name: 'contactName', description: 'Contact Name', example: 'Patricia Rodriguez' },
      { name: 'dealName', description: 'Deal Name', example: 'Complete Digital Transformation' },
      { name: 'companyName', description: 'Company Name', example: 'NextGen Industries' },
      { name: 'stakeholder', description: 'Stakeholder Name', example: 'CFO David Thompson' },
      { name: 'proposedDate', description: 'Proposed Meeting Date', example: 'Thursday, January 30th at 2 PM' },
      { name: 'startDate', description: 'Project Start Date', example: 'February 3rd' },
      { name: 'urgencyMessage', description: 'Urgency/Incentive Message', example: 'Note: We have Q1 launch pricing available until January 31st.' },
      { name: 'expectedResult', description: 'Expected Result', example: '30% operational efficiency gains' },
      { name: 'senderName', description: 'Your Name', example: 'Christopher Lee' },
      { name: 'senderTitle', description: 'Your Title', example: 'VP Sales' },
      { name: 'contactInfo', description: 'Your Contact Info', example: 'christopher.lee@company.com | +1-555-987-6543' }
    ],
    tags: ['closing', 'sales', 'urgent'],
    usageCount: 0
  }
];

export default emailTemplatePresets;
