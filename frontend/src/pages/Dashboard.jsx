import { useState, useEffect, useCallback } from 'react';
import { getBookings, updateBooking, getBlocked, blockSlot, deleteBlock } from '../api';
import s from './Dashboard.module.css';

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
const STATUS_LABEL = { pending: 'انتظار', confirmed: 'مؤكد', done: 'تم', cancelled: 'ملغي' };
const STATUS_CLASS = { pending: s.stPending, confirmed: s.stConfirmed, done: s.stDone, cancelled: s.stCancelled };

export default function Dashboard() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [passError, setPassError] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings,     setBookings]     = useState([]);
  const [blocked,      setBlocked]      = useState([]);
  const [blockForm,    setBlockForm]    = useState({ start_time: '14:00', end_time: '15:00', reason: '' });
  const [loading,      setLoading]      = useState(false);

  const dateStr = toDateStr(selectedDate);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, blRes] = await Promise.all([getBookings(dateStr), getBlocked(dateStr)]);
      setBookings(bRes.data);
      setBlocked(blRes.data);
    } catch {}
    setLoading(false);
  }, [dateStr]);

  useEffect(() => { if (auth) load(); }, [load, auth]);

  async function handleStatus(id, status) {
    await updateBooking(id, status);
    load();
  }

  async function handleBlock(e) {
    e.preventDefault();
    await blockSlot({ blocked_date: dateStr, ...blockForm });
    setBlockForm(f => ({ ...f, reason: '' }));
    load();
  }

  async function handleDeleteBlock(id) {
    await deleteBlock(id);
    load();
  }

  function handleLogin() {
    if (pass === 'rami1994') {
      setAuth(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
  }

  // شاشة تسجيل الدخول
  if (!auth) return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px'
      }}>✂</div>
      <h2 style={{
        color: 'var(--gold)',
        fontSize: '24px',
        fontWeight: '900',
        marginBottom: '8px'
      }}>دخول رامي</h2>
      <p style={{
        color: 'var(--muted)',
        fontSize: '14px',
        marginBottom: '24px'
      }}>هذه الصفحة للحلاق فقط</p>
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        maxWidth: '300px',
        margin: '0 auto'
      }}>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={pass}
          onChange={e => { setPass(e.target.value); setPassError(false); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{
            width: '100%',
            background: 'var(--bg)',
            border: `1px solid ${passError ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: '10px',
            padding: '12px 14px',
            color: 'var(--text)',
            fontSize: '16px',
            marginBottom: '12px',
            fontFamily: 'var(--font)',
            textAlign: 'center',
            letterSpacing: '4px'
          }}
        />
        {passError && (
          <p style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '10px' }}>
            كلمة المرور غلط!
          </p>
        )}
        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '10px',
            background: 'var(--gold)',
            border: 'none',
            color: '#000',
            fontSize: '16px',
            fontWeight: '900',
            cursor: 'pointer',
            fontFamily: 'var(--font)'
          }}
        >
          دخول
        </button>
      </div>
    </div>
  );

  const today  = bookings.filter(b => b.status !== 'cancelled');
  const pending = bookings.filter(b => b.status === 'pending');
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div className={s.sectionTitle} style={{ margin: 0 }}>اختار اليوم</div>
        <button
          onClick={() => setAuth(false)}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--muted)',
            fontSize: '12px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: 'var(--font)'
          }}
        >
          خروج
        </button>
      </div>

      <div className={s.dayPicker}>
        {days.map((d, i) => (
          <button
            key={i}
            className={`${s.dayBtn} ${d.toDateString() === selectedDate.toDateString() ? s.dayActive : ''}`}
            onClick={() => setSelectedDate(d)}
          >
            <div className={s.dNum}>{d.getDate()}</div>
            <div className={s.dName}>{DAYS_AR[d.getDay()].slice(0,3)}</div>
          </button>
        ))}
      </div>

      <div className={s.stats}>
        <div className={s.statCard}>
          <div className={s.statNum}>{today.length}</div>
          <div className={s.statLabel}>مواعيد اليوم</div>
        </div>
        <div className={s.statCard}>
          <div className={s.statNum}>{pending.length}</div>
          <div className={s.statLabel}>في الانتظار</div>
        </div>
      </div>

      <div className={s.sectionTitle}>مواعيد {DAYS_AR[selectedDate.getDay()]}</div>
      {loading
        ? <p className={s.empty}>بنجيب المواعيد...</p>
        : today.length === 0
          ? <p className={s.empty}>مفيش مواعيد النهارده</p>
          : (
            <div className={s.list}>
              {[...today].sort((a,b) => a.slot_time.localeCompare(b.slot_time)).map(b => (
                <div key={b.id} className={s.bookingItem}>
                  <div className={s.bTime}>{b.slot_time.slice(0,5)}</div>
                  <div className={s.bInfo}>
                    <div className={s.bName}>{b.customer_name}</div>
                    <div className={s.bSvc}>{b.service_name} · {b.phone}</div>
                  </div>
                  <div className={s.bActions}>
                    <span className={`${s.badge} ${STATUS_CLASS[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                    {b.status === 'pending' && (
                      <div className={s.actionBtns}>
                        <button className={s.confirmBtn} onClick={() => handleStatus(b.id, 'confirmed')}>✓ تأكيد</button>
                        <button className={s.cancelBtn}  onClick={() => handleStatus(b.id, 'cancelled')}>✕</button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      <button className={s.doneBtn} onClick={() => handleStatus(b.id, 'done')}>تم ✓</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
      }

      <div className={s.sectionTitle} style={{ marginTop: 32 }}>حجب وقت</div>
      <form className={s.blockForm} onSubmit={handleBlock}>
        <div className={s.timeRow}>
          <div className={s.timeField}>
            <label>من</label>
            <input type="time" className={s.inp} value={blockForm.start_time}
              onChange={e => setBlockForm(f => ({ ...f, start_time: e.target.value }))} />
          </div>
          <div className={s.timeField}>
            <label>لـ</label>
            <input type="time" className={s.inp} value={blockForm.end_time}
              onChange={e => setBlockForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
        </div>
        <input className={s.inp} placeholder="السبب (غداء، راحة...)"
          value={blockForm.reason}
          onChange={e => setBlockForm(f => ({ ...f, reason: e.target.value }))} />
        <button type="submit" className={s.blockBtn}>حجب الوقت</button>
      </form>

      {blocked.length > 0 && (
        <>
          <div className={s.sectionTitle}>أوقات محجوبة</div>
          <div className={s.list}>
            {blocked.map(bl => (
              <div key={bl.id} className={`${s.bookingItem} ${s.blockedItem}`}>
                <div className={s.bTime}>⛔</div>
                <div className={s.bInfo}>
                  <div className={s.bName}>{bl.reason || 'راحة'}</div>
                  <div className={s.bSvc}>{bl.start_time.slice(0,5)} → {bl.end_time.slice(0,5)}</div>
                </div>
                <button className={s.cancelBtn} onClick={() => handleDeleteBlock(bl.id)}>✕</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}