import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Enviar una llamada Callback a Webex Contact Center
router.post("/call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Se requiere número de teléfono" });
    }

    let accessToken = process.env.SERVICE_APP_TOKEN || null;

    // 🔑 Obtener token dinámico desde /token/service si no está en env
    if (!accessToken) {
      try {
        const backendBase =
          process.env.SELF_URL ||
          `http://localhost:${process.env.PORT || 10000}`;

        const tokenResp = await fetch(`${backendBase}/token/service`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const tokenJson = await tokenResp.json();
        accessToken =
          tokenJson.access_token ||
          tokenJson.token ||
          tokenJson.accessToken ||
          null;

        if (!accessToken) {
          throw new Error("No se pudo extraer access_token de /token/service");
        }
      } catch (err) {
        console.error("❌ Error al obtener token dinámico:", err);
        return res
          .status(500)
          .json({ error: "No se pudo obtener token dinámico" });
      }
    }

    // 📡 Llamada a la API de Webex CC
    const response = await fetch(`${process.env.WXCC_API_URL}/v1/callback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: phoneNumber,
        entryPointId: process.env.ENTRY_POINT_ID, // la cola de destino
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error en callback:", data);
      return res
        .status(response.status)
        .json({ error: "No se pudo crear callback", details: data });
    }

    res.json({ message: "📞 Callback solicitado con éxito", data });
  } catch (error) {
    console.error("❌ Error en callback:", error);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

export default router;
