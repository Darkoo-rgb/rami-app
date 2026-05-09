require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ──
app.use('/api/services', require('./routes/services'));
app.use('/api/slots',    require('./routes/slots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/blocked',  require('./routes/blocked'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', app: 'رامي باربر' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✂  رامي API شغالة على http://localhost:${PORT}`));
