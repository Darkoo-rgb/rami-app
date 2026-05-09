const router = require('express').Router();
const db = require('../db/pool');

const OPEN_HOUR  = 11; // 11 صباحاً
const CLOSE_HOUR = 23; // 11 مساءً

// GET /api/slots?date=2024-05-08&service_id=1
// يرجع كل المواعيد المتاحة في يوم معين لخدمة معينة
router.get('/', async (req, res) => {
  const { date, service_id } = req.query;
  if (!date || !service_id) {
    return res.status(400).json({ error: 'date و service_id مطلوبين' });
  }

  try {
    // مدة الخدمة
    const svcResult = await db.query(
      'SELECT duration_min FROM services WHERE id = $1',
      [service_id]
    );
    if (!svcResult.rows.length) return res.status(404).json({ error: 'الخدمة مش موجودة' });
    const duration = svcResult.rows[0].duration_min;

    // المواعيد المحجوزة في اليوم ده
    const booked = await db.query(
      `SELECT slot_time, s.duration_min
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE slot_date = $1 AND b.status NOT IN ('cancelled')`,
      [date]
    );

    // الأوقات المحظورة
    const blocked = await db.query(
      'SELECT start_time, end_time FROM blocked_slots WHERE blocked_date = $1',
      [date]
    );

    // بناء كل السلوتس الممكنة
    const slots = [];
    for (let m = OPEN_HOUR * 60; m + duration <= CLOSE_HOUR * 60; m += duration) {
      const slotStart = m;
      const slotEnd   = m + duration;
      const hh = String(Math.floor(m / 60)).padStart(2, '0');
      const mm = String(m % 60).padStart(2, '0');
      const label = `${hh}:${mm}`;

      // تحقق من التعارض مع حجوزات موجودة
      const conflictBooking = booked.rows.some(b => {
        const bStart = timeToMin(b.slot_time);
        const bEnd   = bStart + b.duration_min;
        return slotStart < bEnd && slotEnd > bStart;
      });

      // تحقق من التعارض مع أوقات محظورة
      const conflictBlock = blocked.rows.some(b => {
        const bStart = timeToMin(b.start_time);
        const bEnd   = timeToMin(b.end_time);
        return slotStart < bEnd && slotEnd > bStart;
      });

      slots.push({ time: label, available: !conflictBooking && !conflictBlock });
    }

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function timeToMin(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

module.exports = router;
