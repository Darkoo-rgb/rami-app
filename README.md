# ✂ رامي — أبليكيشن حجز المواعيد

## هيكل المشروع
```
rami-app/
├── backend/          ← Node.js + Express + PostgreSQL
│   ├── server.js
│   ├── db/
│   │   ├── pool.js
│   │   └── schema.sql
│   └── routes/
│       ├── services.js
│       ├── slots.js
│       ├── bookings.js
│       └── blocked.js
└── frontend/         ← React + Vite
    └── src/
        ├── App.jsx
        ├── api.js
        └── pages/
            ├── BookingPage.jsx   ← شاشة العميل
            └── Dashboard.jsx     ← داشبورد رامي
```

---

## تشغيل المشروع

### 1. قاعدة البيانات
```bash
# إنشاء قاعدة بيانات PostgreSQL
createdb rami_barber

# تطبيق الـ schema
psql rami_barber -f backend/db/schema.sql
```

### 2. الباك-إند
```bash
cd backend
cp .env.example .env
# عدّل DATABASE_URL في .env بالبيانات بتاعتك

npm install
npm run dev
# شغال على http://localhost:4000
```

### 3. الفرونت-إند
```bash
cd frontend
npm install
npm run dev
# شغال على http://localhost:5173
```

---

## الـ API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | /api/services | كل الخدمات |
| GET | /api/slots?date=&service_id= | المواعيد المتاحة |
| POST | /api/bookings | حجز جديد |
| GET | /api/bookings?date= | مواعيد يوم (داشبورد) |
| PATCH | /api/bookings/:id | تغيير status |
| POST | /api/blocked | حجب وقت |
| DELETE | /api/blocked/:id | حذف حجب |

---

## الخطوات الجاية
- [ ] إشعارات واتساب (Twilio WhatsApp API)
- [ ] تسجيل دخول رامي (JWT)
- [ ] رفع على Railway أو Render (مجاني)
