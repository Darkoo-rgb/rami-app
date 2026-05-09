const router = require('express').Router();
const db = require('../db/pool');

// GET /api/services — كل الخدمات المتاحة
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM services WHERE is_active = TRUE ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
