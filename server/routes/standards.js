const express = require('express');
const auth = require('../middleware/auth');
const { queryStandards, getStandardByCode } = require('../utils/standardsQuery');

const router = express.Router();

// GET /api/standards?type=ccss-ela&grade=5&q=reading
router.get('/', auth, (req, res) => {
  const { type, grade, q } = req.query;
  try {
    const results = queryStandards({ type, grade, q });
    res.json({ standards: results, count: results.length });
  } catch (err) {
    console.error('Standards query error:', err);
    res.status(500).json({ error: 'Could not load standards.' });
  }
});

// GET /api/standards/:code
router.get('/:code', auth, (req, res) => {
  const standard = getStandardByCode(req.params.code);
  if (!standard) return res.status(404).json({ error: 'Standard not found.' });
  res.json({ standard });
});

module.exports = router;
