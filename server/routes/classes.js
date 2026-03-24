const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

const VALID_GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const VALID_STANDARDS = ['ccss-ela', 'ccss-math', 'ngss', 'hss', 'vapa', 'pe', 'cte'];
const MAX_CLASSES = 8;

const classValidators = [
  body('nickname').trim().notEmpty().withMessage('Class nickname is required.').isLength({ max: 100 }),
  body('grade_level').isIn(VALID_GRADES).withMessage('Invalid grade level.'),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 255 }),
  body('standards_type').isIn(VALID_STANDARDS).withMessage('Invalid standards type.'),
];

// GET /api/classes
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM classes WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json({ classes: result.rows });
  } catch (err) {
    console.error('Get classes error:', err);
    res.status(500).json({ error: 'Could not load classes.' });
  }
});

// POST /api/classes
router.post('/', auth, classValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM classes WHERE user_id = $1',
      [req.user.id]
    );
    if (parseInt(countResult.rows[0].count) >= MAX_CLASSES) {
      return res.status(400).json({ error: `You can have up to ${MAX_CLASSES} classes.` });
    }

    const { nickname, grade_level, subject, standards_type } = req.body;
    const result = await pool.query(
      `INSERT INTO classes (user_id, nickname, grade_level, subject, standards_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, nickname, grade_level, subject, standards_type]
    );
    res.status(201).json({ class: result.rows[0] });
  } catch (err) {
    console.error('Create class error:', err);
    res.status(500).json({ error: 'Could not create class.' });
  }
});

// PUT /api/classes/:id
router.put('/:id', auth, classValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;
  const { nickname, grade_level, subject, standards_type } = req.body;
  try {
    const result = await pool.query(
      `UPDATE classes SET nickname=$1, grade_level=$2, subject=$3, standards_type=$4
       WHERE id=$5 AND user_id=$6
       RETURNING *`,
      [nickname, grade_level, subject, standards_type, id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Class not found.' });
    res.json({ class: result.rows[0] });
  } catch (err) {
    console.error('Update class error:', err);
    res.status(500).json({ error: 'Could not update class.' });
  }
});

// DELETE /api/classes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM classes WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Class not found.' });
    res.json({ message: 'Class deleted.' });
  } catch (err) {
    console.error('Delete class error:', err);
    res.status(500).json({ error: 'Could not delete class.' });
  }
});

module.exports = router;
