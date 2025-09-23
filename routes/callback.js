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

    // 🔑 Usa el token generado dinámicamente desde /token/service
    const response = await fetch(`${process.env.WXCC_API_URL}/v1/callback`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SERVICE_APP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destination: phoneNumber,
        entryPointId: process.env.ENTRY_POINT_ID, // la cola de destino
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("❌ Error en callback:", data);
      return res.status(400).json({ error: "No se pudo crear callback", details: data });
    }

    res.json({ message: "📞 Callback solicitado con éxito", data });
  } catch (error) {
    console.error("❌ Error en callback:", error);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

export default router;
