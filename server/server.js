// server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// ===== CONFIG =====
// variables de entorno para Backend
// Render, Railway, Vercel, etc.
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const WEBEX_API = 'https://webexapis.com/v1';

// Cache del token en memoria
let serviceAppToken = null;
let tokenExpiry = 0;

// === Función para obtener o renovar el Service App Token ===
async function getServiceAppToken() {
  const now = Math.floor(Date.now() / 1000);

  // Valida si el token es válido
  if (serviceAppToken && now < tokenExpiry - 60) {
    return serviceAppToken;
  }

  console.log('Solicitando nuevo Service App Token a Webex...');

  const r = await fetch(`${WEBEX_API}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: 'spark-admin:telephony_config_read spark-admin:telephony_config_write spark-admin:telephony_config_call:read spark-admin:telephony_config_call:write'
    })
  });

  const data = await r.json();

  if (!data.access_token) {
    console.error('Error obteniendo Service App Token:', data);
    throw new Error('No se pudo obtener Service App Token');
  }

  serviceAppToken = data.access_token;
  tokenExpiry = now + data.expires_in; // normalmente 86400 seg (24h)

  return serviceAppToken;
}

// === Endpoint para Guest Token ===
app.get('/api/guest-token', async (req, res) => {
  try {
    const token = await getServiceAppToken();

    const r = await fetch(`${WEBEX_API}/guests/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ displayName: "Visitante Web" })
    });

    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error('Error Guest Token:', err);
    res.status(500).json({ error: 'Error obteniendo guest token' });
  }
});

// === Endpoint para JWE Token (Click-to-Call) ===
app.post('/api/jwe-token', async (req, res) => {
  try {
    const { calledNumber, guestName } = req.body;
    const token = await getServiceAppToken();

    const r = await fetch(`${WEBEX_API}/telephony/config/clickToCall/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        phoneNumber: calledNumber,
        displayName: guestName || "Visitante Web"
      })
    });

    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error('Error JWE Token:', err);
    res.status(500).json({ error: 'Error obteniendo JWE token' });
  }
});

// === Start server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend Webex corriendo en puerto ${PORT}`));
