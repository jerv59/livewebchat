// server.js
// Backend para "Te llamamos" (Callback) -> Webex Contact Center
// ------------------------------------------------------------
// Nota importante:
// - La sección activa (más abajo) genera token con client_credentials (autorenovación),
//   y crea llamadas hacia un Entry Point de Webex Contact Center.
// ------------------------------------------------------------

import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// ------------------------------------------------------------------
// ================== CÓDIGO PREVIO (COMENTADO) =======================
// ------------------------------------------------------------------
// Si necesitas restaurar alguna de estas versiones anteriores,
// copia y pega el bloque que necesites y descomenta.
// ------------------------------------------------------------------

/*
-------------------- Versión anterior A (ejemplo de guest/jwe endpoints) --------------------

import express from 'express';
import fetch from 'node-fetch';
const app = express();
app.use(express.json());

const SERVICE_APP_TOKEN = process.env.SERVICE_APP_TOKEN; // (versión que usaba token fijo)

app.get('/api/guest-token', async (req, res) => {
  const resp = await fetch('https://webexapis.com/v1/guests/token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_APP_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ subject: `guest-${Date.now()}`, displayName: 'Visitante Web' })
  });
  const data = await resp.json();
  res.json({ accessToken: data.access_token });
});

app.post('/api/jwe-token', async (req, res) => {
  const { calledNumber, guestName } = req.body;
  const r = await fetch('https://webexapis.com/v1/telephony/click2call/callToken', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SERVICE_APP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ calledNumber, guestName })
  });
  const d = await r.json();
  res.json(d);
});
------------------------------------------------------------------------------------------
*/

/*
-------------------- Versión anterior B (simple) --------------------
 // Endpoint que devolvía token fijo (no recomendado para producción)
 app.get('/token', (req, res) => {
   if (!process.env.SERVICE_APP_TOKEN) return res.status(500).send({error: 'No token'});
   res.json({ access_token: process.env.SERVICE_APP_TOKEN });
 });
--------------------------------------------------------------------
*/

// ------------------------------------------------------------------
// ================== FIN CÓDIGO PREVIO (COMENTADO) ===================
// ------------------------------------------------------------------


// ------------------------ CONFIG / HELPERS -------------------------

// URL por defecto para Webex Contact Center (región US1). Si tu tenant usa otra región,
// define WXCC_API_URL en Variables de Entorno (Render) con la URL correcta.
const WXCC_API_URL = process.env.WXCC_API_URL || "https://api.wxcc-us1.cisco.com/v1/telephony/calls";

// Caché en memoria para el token de Service App
let cachedToken = null;
let tokenExpiry = 0; // timestamp ms

// Obtiene / renueva token via client_credentials y lo cachea
async function getAccessToken() {
  const now = Date.now();

  // Si token existe y no expiró (con 60s de margen), reutilizar
  if (cachedToken && tokenExpiry && now < tokenExpiry - 60000) {
    return cachedToken;
  }

  // Preparar body para el request de token
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID || "",
    client_secret: process.env.CLIENT_SECRET || ""
  });

  // Si definiste ORG_ID, agrégalo (opcional en algunos tenants)
  if (process.env.ORG_ID) {
    params.append("org_id", process.env.ORG_ID);
  }

  try {
    const tokenResp = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const tokenData = await tokenResp.json();

    if (!tokenResp.ok || !tokenData.access_token) {
      console.error("Error obteniendo access_token desde Webex:", tokenData);
      throw new Error("No se pudo generar token (ver logs)");
    }

    cachedToken = tokenData.access_token;
    // tokenData.expires_in normalmente viene en segundos
    tokenExpiry = Date.now() + ( (tokenData.expires_in || 3600) * 1000 );

    console.log("✅ Nuevo Service App token obtenido. Expira en (ms):", tokenExpiry);
    return cachedToken;
  } catch (err) {
    console.error("getAccessToken error:", err);
    throw err;
  }
}

// ------------------------ RUTAS PÚBLICAS ---------------------------

// Ruta raíz - salud
app.get("/", (req, res) => {
  res.send("✅ Webex Callback Backend activo (Entry Point mode).");
});

// Endpoint para iniciar callback -> enruta a Entry Point de Webex Contact Center
// Body: { "phoneNumber": "+57300...." }
app.post("/callback-call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Debe enviar phoneNumber en body" });

    // Verificar ENTRY_POINT_ID configurada
    const entryPointId = process.env.ENTRY_POINT_ID;
    if (!entryPointId) {
      return res.status(500).json({ error: "ENTRY_POINT_ID no configurado en environment" });
    }

    // Obtener token (se renueva automáticamente si es necesario)
    const accessToken = await getAccessToken();

    // Construir llamada hacia Webex Contact Center
    const callResp = await fetch(WXCC_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        destination: phoneNumber,
        entryPointId: entryPointId
      })
    });

    const callData = await callResp.json();

    if (!callResp.ok) {
      console.error("Error desde Webex CC al crear llamada:", callData);
      return res.status(500).json({ error: "Webex CC error", details: callData });
    }

    // Respuesta exitosa
    return res.json({
      message: "📞 Llamada enviada al Entry Point",
      call: callData
    });

  } catch (err) {
    console.error("Error en /callback-call:", err);
    return res.status(500).json({ error: "Error interno del servidor", details: err.message });
  }
});

// (Opcional) Endpoint para depuración: devuelve token actual (no recomendado en producción)
app.get("/debug/token", async (req, res) => {
  try {
    const token = await getAccessToken();
    // Para seguridad no devolvemos todo el token en producción; este endpoint es solo para testing.
    res.json({ ok: true, token_preview: token ? `${token.slice(0,40)}...` : null, expires_at: tokenExpiry });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ------------------------ INICIAR SERVIDOR -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en puerto ${PORT}`);
  console.log("WXCC_API_URL =", WXCC_API_URL);
});
