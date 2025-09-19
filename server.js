// =======================================
// server.js - Backend para Click to Call
// =======================================

// 🔹 Dependencias
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

// Endpoint para generar la llamada de callback
app.post("/callback-call", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: "Número no válido" });
  }

  try {
    const response = await fetch("https://webexapis.com/v1/telephony/calls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.SERVICE_APP_TOKEN}`
      },
      body: JSON.stringify({
        destination: phoneNumber,
        targetUserId: process.env.AGENT_USER_ID // Webex User ID del agente
      })
    });

    const data = await response.json();
    if (response.ok) {
      res.json({ success: true, call: data });
    } else {
      res.status(400).json({ error: data });
    }
  } catch (err) {
    console.error("Error al iniciar llamada:", err);
    res.status(500).json({ error: "Fallo al iniciar la llamada" });
  }
});

// 🔹 Inicialización de Express
const app = express();
const PORT = process.env.PORT || 10000;

// 🔹 Variables de entorno (Render → Dashboard → Environment)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const WEBEX_AUTH_URL = "https://webexapis.com/v1/access_token";

// 🔹 Cache de token en memoria
let cachedToken = null;
let tokenExpiry = null;

// =======================
// 🔹 Función: Generar nuevo token con Client Credentials Flow
// =======================
async function generateServiceToken() {
  try {
    const response = await fetch(WEBEX_AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope:
          "spark-admin:telephony_config_read spark-admin:telephony_config_write spark-admin:telephony_config_call:read spark-admin:telephony_config_call:write"
      })
    });

    const data = await response.json();

    if (data.access_token) {
      cachedToken = data.access_token;
      tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 1 min de buffer
      console.log("✅ Nuevo token generado");
      return cachedToken;
    } else {
      console.error("❌ Error al generar token:", data);
      throw new Error("No se pudo generar el token");
    }
  } catch (err) {
    console.error("❌ Error en generateServiceToken:", err);
    throw err;
  }
}

// =======================
// 🔹 Función: Obtener token (usa cache si aún es válido)
// =======================
async function getServiceToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  return await generateServiceToken();
}

// =======================
// 🔹 Endpoint público: /token
// =======================
app.get("/token", async (req, res) => {
  try {
    const token = await getServiceToken();
    res.json({ access_token: token });
  } catch (err) {
    res.status(500).json({ error: "No se pudo generar el token" });
  }
});

// 🔹 Endpoint de prueba
app.get("/", (req, res) => {
  res.send("✅ Backend de Click-to-Call en Render está funcionando");
});

// =======================
// 🔹 Iniciar servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
});
