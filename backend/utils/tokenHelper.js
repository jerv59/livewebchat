// backend/utils/tokenHelper.js
import fetch from "node-fetch";

// Variables en memoria
let cachedAccessToken = null;
let tokenExpiry = null;

/**
 * Genera o devuelve el token actual desde caché
 */
export async function getAccessToken() {
  try {
    // Si hay token válido en memoria, devolverlo
    if (cachedAccessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedAccessToken;
    }

    // Solicitar nuevo token a Webex usando refresh_token
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

    if (!response.ok || data.error) {
      console.error("❌ Error generando access token:", data);
      throw new Error(data.error_description || "No se pudo generar token");
    }

    // Guardar en caché
    cachedAccessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;

    console.log("✅ Nuevo Access Token generado y cacheado");

    return cachedAccessToken;
  } catch (error) {
    console.error("❌ Error en tokenHelper:", error.message);
    throw error;
  }
}
