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

// PATCH /api/services/:id — رامي يعدل سعر أو مدة خدمة
router.patch('/:id', async (req, res) => {
  const { price_egp, duration_min, name_ar } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE services
       SET price_egp    = COALESCE($1, price_egp),
           duration_min = COALESCE($2, duration_min),
           name_ar      = COALESCE($3, name_ar)
       WHERE id = $4
       RETURNING *`,
      [price_egp, duration_min, name_ar, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'الخدمة مش موجودة' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
