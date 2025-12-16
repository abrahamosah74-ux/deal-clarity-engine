const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Manager dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    res.json({
      message: 'Manager dashboard stats',
      teamSize: 0,
      activeDeals: 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

module.exports = router;
