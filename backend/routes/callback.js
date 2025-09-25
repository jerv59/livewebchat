// backend/routes/callback.js
import express from "express";
import fetch from "node-fetch";
import { getAccessToken } from "../utils/tokenHelper.js";

const router = express.Router();

/**
 * POST /callback/call
 * body: { phoneNumber: "+573001112233" }
 * Envia un callback a la cola de Webex Contact Center
 */
router.post("/call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Se requiere número de teléfono" });
    }

    // 🔑 Obtener token dinámico desde tokenHelper
    const accessToken = await getAccessToken();

    // Llamada al endpoint de Webex CC
    const response = await fetch(`${process.env.WXCC_API_URL}/v1/callback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: phoneNumber,
        entryPointId: process.env.ENTRY_POINT_ID, // Entry Point configurado
      }),
    });

    // ⚡ Capturar respuesta cruda
    const rawText = await response.text();
    console.log("📩 Respuesta WxCC:", rawText);

    let data;
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch (parseError) {
      return res.status(500).json({
        error: "Respuesta no es JSON válido",
        raw: rawText,
      });
    }

    if (!response.ok || data.errors) {
      console.error("❌ Error en callback:", data);
      return res.status(response.status).json({
        error: "No se pudo crear callback",
        status: response.status,
        details: data,
      });
    }

    res.json({ message: "📞 Callback solicitado con éxito", data });
  } catch (error) {
    console.error("❌ Error en callback:", error.message);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

export default router;
