const router = require('express').Router();
const db = require('../db/pool');

// GET /api/bookings?date=2024-05-08  — مواعيد يوم معين (داشبورد رامي)
router.get('/', async (req, res) => {
  const { date } = req.query;
  const filter = date ? 'WHERE b.slot_date = $1' : '';
  const params = date ? [date] : [];

  try {
    const { rows } = await db.query(
      `SELECT b.id, b.slot_date, b.slot_time, b.status, b.notes,
              c.name AS customer_name, c.phone,
              s.name_ar AS service_name, s.duration_min, s.price_egp
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN services  s ON s.id = b.service_id
       ${filter}
       ORDER BY b.slot_date, b.slot_time`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings — حجز جديد
router.post('/', async (req, res) => {
  const { name, phone, service_id, slot_date, slot_time, notes } = req.body;
  if (!name || !phone || !service_id || !slot_date || !slot_time) {
    return res.status(400).json({ error: 'كل الحقول مطلوبة' });
  }

  try {
    // سجّل العميل لو مش موجود
    const custResult = await db.query(
      `INSERT INTO customers (name, phone)
       VALUES ($1, $2)
       ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name, phone]
    );
    const customer_id = custResult.rows[0].id;

    // تحقق إن السلوت لسه متاح
    const conflict = await db.query(
      `SELECT b.id FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.slot_date = $1
         AND b.status NOT IN ('cancelled')
         AND b.slot_time < ($2::time + s.duration_min * interval '1 minute')
         AND (b.slot_time + s.duration_min * interval '1 minute') > $2::time`,
      [slot_date, slot_time]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'الوقت ده اتحجز للتو، اختار وقت تاني' });
    }

    const { rows } = await db.query(
      `INSERT INTO bookings (customer_id, service_id, slot_date, slot_time, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, status`,
      [customer_id, service_id, slot_date, slot_time, notes]
    );

    res.status(201).json({ booking_id: rows[0].id, status: rows[0].status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id — تغيير status (رامي يأكد أو يلغي)
router.patch('/:id', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'done', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: 'status مش صح' });
  }

  try {
    const { rows } = await db.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'الحجز مش موجود' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id — إلغاء
router.delete('/:id', async (req, res) => {
  try {
    await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1",
      [req.params.id]
    );
    res.json({ message: 'تم الإلغاء' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
