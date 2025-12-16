const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload file
router.post('/', auth, upload.single('file'), (req, res) => {
  try {
    res.json({
      success: true,
      fileName: req.file.originalname,
      path: req.file.path
    });
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;
