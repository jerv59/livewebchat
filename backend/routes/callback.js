// backend/routes/callback.js
import express from "express";
import fetch from "node-fetch";
import { getAccessToken } from "../utils/tokenHelper.js";

const router = express.Router();

/**
 * POST /callback/call
 * body: { phoneNumber: "+573001112233" }
 * Envía una solicitud de callback a Webex Contact Center (v2 API)
 */
router.post("/call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Se requiere número de teléfono" });
    }

    // 🔑 Obtener token dinámico
    const accessToken = await getAccessToken();

    // 📡 Construir endpoint v2 con orgId y entryPointId
    const orgId = process.env.WXCC_ORG_ID;
    const entryPointId = process.env.ENTRY_POINT_ID;
    const apiUrl = `${process.env.WXCC_API_URL}/organization/${orgId}/v2/entry-point/${entryPointId}/callback`;

    console.log("➡️ Enviando callback a:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: phoneNumber,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    console.log("📩 Respuesta WxCC:", data);

    if (!response.ok || data.errors) {
      return res.status(response.status).json({
        error: "No se pudo crear callback",
        status: response.status,
        details: data,
      });
    }

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
