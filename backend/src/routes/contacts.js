const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contact = require('../models/Contact');

// Create contact
router.post('/', auth, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, mobile, company, jobTitle, department, leadScore } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ error: 'First name and email are required' });
    }

    // Check for duplicate email
    const existingContact = await Contact.findOne({ userId: req.user._id, email });
    if (existingContact) {
      return res.status(409).json({ error: 'Contact with this email already exists' });
    }

    const contact = new Contact({
      userId: req.user._id,
      firstName,
      lastName: lastName || '',
      email,
      phone: phone || '',
      mobile: mobile || '',
      company: company || '',
      jobTitle: jobTitle || '',
      department: department || '',
      leadScore: leadScore || 0
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Get all contacts
router.get('/', auth, async (req, res) => {
  try {
    const { search, company, tags, sortBy = 'updatedAt', order = 'desc', page = 1, limit = 50 } = req.query;

    let filter = { userId: req.user._id };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    if (company) {
      filter.company = company;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const sortObj = {};
    sortObj[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)),
      Contact.countDocuments(filter)
    ]);

    res.json({
      contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Get contact by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, userId: req.user._id }).populate('deals');

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

// Update contact
router.put('/:id', auth, async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'mobile', 'company', 'jobTitle', 'department', 'industry', 'address', 'city', 'state', 'country', 'notes', 'tags', 'source', 'leadScore', 'lastContactedAt', 'nextFollowUp', 'socialProfiles', 'preferences'];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Remove contact from deals
    const Deal = require('../models/Deal');
    await Deal.updateMany(
      { 'contact.id': contact._id },
      { $unset: { 'contact': 1 } }
    );

    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Add tag to contact
router.post('/:id/tags', auth, async (req, res) => {
  try {
    const { tag } = req.body;
    
    if (!tag) {
      return res.status(400).json({ error: 'Tag is required' });
    }

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $addToSet: { tags: tag } },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Add tag error:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// Remove tag from contact
router.delete('/:id/tags/:tag', auth, async (req, res) => {
  try {
    const { id, tag } = req.params;

    const contact = await Contact.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $pull: { tags: tag } },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Remove tag error:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

// Get contacts by lead score
router.get('/score/leads', auth, async (req, res) => {
  try {
    const { minScore = 50, limit = 50 } = req.query;

    const contacts = await Contact.find({
      userId: req.user._id,
      leadScore: { $gte: parseInt(minScore) }
    })
      .sort({ leadScore: -1 })
      .limit(parseInt(limit));

    res.json(contacts);
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// Get contact statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      { $match: { userId: req.user._id } },
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          avgLeadScore: { $avg: '$leadScore' },
          highPriorityLeads: {
            $sum: {
              $cond: [{ $gte: ['$leadScore', 80] }, 1, 0]
            }
          },
          companiesRepresented: { $addToSet: '$company' }
        }
      },
      {
        $project: {
          _id: 0,
          totalContacts: 1,
          avgLeadScore: { $round: ['$avgLeadScore', 2] },
          highPriorityLeads: 1,
          uniqueCompanies: { $size: '$companiesRepresented' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalContacts: 0,
      avgLeadScore: 0,
      highPriorityLeads: 0,
      uniqueCompanies: 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
