// server/server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());

// Cambia el origin por el de tu página Pages.dev para mayor seguridad
app.use(cors({
  origin: ['https://betaucaastigo.pages.dev', 'http://localhost:3000'] // ajustar según necesites
}));

const SERVICE_APP_TOKEN = process.env.SERVICE_APP_TOKEN; // sin "Bearer"

if (!SERVICE_APP_TOKEN) {
  console.error('ERROR: set SERVICE_APP_TOKEN in environment (no "Bearer " prefix)');
  process.exit(1);
}

// Endpoint: devuelve token de guest (simplificado para cliente)
app.get('/api/guest-token', async (req, res) => {
  try {
    const resp = await fetch('https://webexapis.com/v1/guests/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_APP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: `guest-${Date.now()}`,
        displayName: 'Visitante Web'
      })
    });
    const data = await resp.json();
    // Normalizamos la respuesta para el frontend
    return res.json({ accessToken: data.access_token || data.accessToken || data.accessTokenValue || data });
  } catch (err) {
    console.error('guest-token error', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: devuelve JWE call token para click-to-call
app.post('/api/jwe-token', async (req, res) => {
  try {
    const { calledNumber, guestName = 'Visitante Web' } = req.body;
    if (!calledNumber) return res.status(400).json({ error: 'calledNumber required' });

    const resp = await fetch('https://webexapis.com/v1/telephony/click2call/callToken', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_APP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ calledNumber, guestName })
    });

    const data = await resp.json();
    return res.json({ callToken: data.callToken || data.call_token || data.jwe || data });
  } catch (err) {
    console.error('jwe-token error', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`CTC server listening on ${PORT}`));
