// backend/routes/callback.js
import express from "express";
import fetch from "node-fetch";
import { getAccessToken } from "../utils/tokenHelper.js";

const router = express.Router();

/**
 * POST /callback/call
 * body: { phoneNumber: "+573001112233" }
 * Envía una solicitud de callback a Webex Contact Center (v1 API)
 */
router.post("/call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Se requiere número de teléfono" });
    }

    // 🔑 Obtener token dinámico (desde tokenHelper.js)
    const accessToken = await getAccessToken();

    // 🧩 Variables de entorno
    const orgId = process.env.WXCC_ORG_ID;
    const entryPointId = process.env.ENTRY_POINT_ID;

    // 🛰️ Endpoint correcto para crear Callback
    const apiUrl = `${process.env.WXCC_API_URL}/organization/${orgId}/entry-point/${entryPointId}/callback`;

    console.log("➡️ Enviando solicitud de Callback a:", apiUrl);

    // 📡 Enviar solicitud a la API de Webex Contact Center
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        destination: phoneNumber,
      }),
    });

    // Intentar parsear la respuesta
    let data = {};
    try {
      data = await response.json();
    } catch (parseError) {
      console.warn("⚠️ No se pudo parsear la respuesta JSON:", parseError.message);
    }

    console.log("📩 Respuesta WxCC:", response.status, data);

    if (!response.ok || data.errors) {
      return res.status(response.status).json({
        error: "No se pudo crear callback",
        status: response.status,
        details: data,
      });
    }

    // ✅ Callback creado exitosamente
    res.json({
      message: "📞 Callback solicitado con éxito",
      data,
    });
  } catch (error) {
    console.error("❌ Error en callback:", error.message);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

export default router;
