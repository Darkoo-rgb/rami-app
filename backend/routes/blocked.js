const router = require('express').Router();
const db = require('../db/pool');

// GET /api/blocked?date=2024-05-08
router.get('/', async (req, res) => {
  const { date } = req.query;
  try {
    const { rows } = await db.query(
      'SELECT * FROM blocked_slots WHERE blocked_date = $1 ORDER BY start_time',
      [date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blocked — رامي يحجب وقت
router.post('/', async (req, res) => {
  const { blocked_date, start_time, end_time, reason } = req.body;
  if (!blocked_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'التاريخ والوقت مطلوبين' });
  }
  try {
    const { rows } = await db.query(
      `INSERT INTO blocked_slots (blocked_date, start_time, end_time, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [blocked_date, start_time, end_time, reason || 'راحة']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/blocked/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM blocked_slots WHERE id = $1', [req.params.id]);
    res.json({ message: 'تم الحذف' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
