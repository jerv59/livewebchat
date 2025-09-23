// toke de Integration APP para Callback
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Variable temporal para guardar el último access_token en memoria
let cachedAccessToken = null;
let tokenExpiry = null;

// 🔑 Endpoint para refrescar token automáticamente
router.get("/refresh", async (req, res) => {
  try {
    // Si ya tenemos un token válido en caché, lo devolvemos
    if (cachedAccessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return res.json({ access_token: cachedAccessToken, cached: true });
    }

    // Llamar a Webex API para renovar el token
    const response = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        refresh_token: process.env.REFRESH_TOKEN,
      }),
    });

    const data = await response.json();

    if (data.errors || data.error) {
      console.error("❌ Error al refrescar token:", data);
      return res
        .status(400)
        .json({ error: "No se pudo refrescar token", details: data });
    }

    // Guardamos token en memoria y calculamos expiración
    cachedAccessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000; // `expires_in` viene en segundos

    console.log("✅ Nuevo Access Token generado y cacheado");

    res.json({
      access_token: cachedAccessToken,
      expires_in: data.expires_in,
      refresh_token: data.refresh_token, // ⚠️ solo para depuración, no expongas en producción
    });
  } catch (error) {
    console.error("❌ Error interno al refrescar token:", error);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

// 🔑 Endpoint para obtener el token actual en memoria
router.get("/current", (req, res) => {
  if (!cachedAccessToken) {
    return res
      .status(404)
      .json({ error: "No hay token en memoria, usa /token/refresh" });
  }
  res.json({ access_token: cachedAccessToken, expires_at: tokenExpiry });
});

export default router;
