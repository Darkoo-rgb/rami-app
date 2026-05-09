import { useState, useEffect } from 'react';
import { getServices, getSlots, createBooking } from '../api';
import s from './BookingPage.module.css';

const DAYS_AR   = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function BookingPage() {
  const [services,  setServices]  = useState([]);
  const [slots,     setSlots]     = useState([]);
  const [selSvc,    setSelSvc]    = useState(null);
  const [selDate,   setSelDate]   = useState(null);
  const [selSlot,   setSelSlot]   = useState(null);
  const [form,      setForm]      = useState({ name: '', phone: '' });
  const [step,      setStep]      = useState(1); // 1=service, 2=date/time, 3=info, 4=done
  const [loading,   setLoading]   = useState(false);
  const [booking,   setBooking]   = useState(null);
  const [error,     setError]     = useState('');

  // الأيام الـ 8 القادمة
  const dates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d;
  });

  useEffect(() => {
    getServices().then(r => setServices(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selSvc || !selDate) return;
    setSlots([]); setSelSlot(null);
    getSlots(toDateStr(selDate), selSvc.id).then(r => setSlots(r.data)).catch(() => {});
  }, [selSvc, selDate]);

  async function handleBook() {
    if (!form.name || !form.phone) { setError('اكتب اسمك ورقمك'); return; }
    setLoading(true); setError('');
    try {
      const r = await createBooking({
        name: form.name, phone: form.phone,
        service_id: selSvc.id,
        slot_date:  toDateStr(selDate),
        slot_time:  selSlot,
      });
      setBooking(r.data);
      setStep(4);
    } catch (e) {
      setError(e.response?.data?.error || 'في مشكلة، حاول تاني');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setSelSvc(null); setSelDate(null); setSelSlot(null);
    setForm({ name: '', phone: '' }); setStep(1); setBooking(null); setError('');
  }

  return (
    <div>
      {/* ── HERO ── */}
      <div className={s.hero}>
        <h1>احجز موعد<br />حلاقتك مع <span>رامي</span></h1>
        <div className={s.badge}>متاح من 11ص لـ 11م</div>
      </div>

      {/* ── STEP 1: الخدمة ── */}
      <div className={s.sectionTitle}>اختار الخدمة</div>
      <div className={s.services}>
        {services.map(svc => (
          <div
            key={svc.id}
            className={`${s.svcCard} ${selSvc?.id === svc.id ? s.selected : ''}`}
            onClick={() => { setSelSvc(svc); setStep(2); }}
          >
            <div className={s.check}>{selSvc?.id === svc.id ? '✓' : ''}</div>
            <div className={s.svcInfo}>
              <div className={s.svcName}>{svc.name_ar}</div>
              <div className={s.svcMeta}>{svc.name_en} · {svc.duration_min} دقيقة</div>
            </div>
            <div className={s.svcRight}>
              <div className={s.svcPrice}>{svc.price_egp} ج</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── STEP 2: التاريخ والوقت ── */}
      {step >= 2 && (
        <>
          <div className={s.sectionTitle}>اختار اليوم</div>
          <div className={s.dates}>
            {dates.map((d, i) => (
              <button
                key={i}
                className={`${s.dateBtn} ${selDate?.toDateString() === d.toDateString() ? s.dateActive : ''}`}
                onClick={() => { setSelDate(d); setStep(2); }}
              >
                <div className={s.dNum}>{d.getDate()}</div>
                <div className={s.dName}>{DAYS_AR[d.getDay()].slice(0, 3)}</div>
              </button>
            ))}
          </div>

          {selDate && (
            <>
              <div className={s.sectionTitle}>اختار الوقت</div>
              {slots.length === 0
                ? <p className={s.noSlots}>بنجيب المواعيد...</p>
                : (
                  <div className={s.slots}>
                    {slots.map(sl => (
                      <button
                        key={sl.time}
                        disabled={!sl.available}
                        className={`${s.slot} ${!sl.available ? s.taken : ''} ${selSlot === sl.time ? s.slotActive : ''}`}
                        onClick={() => { setSelSlot(sl.time); setStep(3); }}
                      >
                        {sl.time}
                      </button>
                    ))}
                  </div>
                )
              }
            </>
          )}
        </>
      )}

      {/* ── STEP 3: بيانات العميل ── */}
      {step >= 3 && selSlot && (
        <div className={s.formCard}>
          <div className={s.sectionTitle} style={{ marginTop: 0 }}>بياناتك</div>
          <input
            className={s.inp}
            placeholder="اسمك"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <input
            className={s.inp}
            placeholder="رقم موبايلك"
            type="tel"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          {error && <div className={s.error}>{error}</div>}
          <button className={s.bookBtn} onClick={handleBook} disabled={loading}>
            {loading ? 'بنحجز...' : 'تأكيد الحجز'}
          </button>
        </div>
      )}

      {/* ── STEP 4: تأكيد ── */}
      {step === 4 && booking && (
        <div className={s.confirmCard}>
          <div className={s.confirmIcon}>✅</div>
          <h2>تم الحجز!</h2>
          <p>هيوصلك تأكيد على واتساب</p>
          <div className={s.confirmDetail}>
            <div className={s.row}><span className={s.label}>الخدمة</span><span>{selSvc.name_ar}</span></div>
            <div className={s.row}>
              <span className={s.label}>اليوم</span>
              <span>{DAYS_AR[selDate.getDay()]} {selDate.getDate()} {MONTHS_AR[selDate.getMonth()]}</span>
            </div>
            <div className={s.row}><span className={s.label}>الوقت</span><span>{selSlot}</span></div>
            <div className={s.row}><span className={s.label}>السعر</span><span>{selSvc.price_egp} جنيه</span></div>
            <div className={s.row}><span className={s.label}>رقم الحجز</span><span>#{booking.booking_id}</span></div>
          </div>
          <button className={s.bookBtn} onClick={reset}>حجز موعد جديد</button>
        </div>
      )}
    </div>
  );
}
