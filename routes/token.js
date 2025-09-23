import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Generar Token de Service App (para llamadas/callback)
router.get("/service", async (req, res) => {
  try {
    const response = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("❌ Error generando Service App Token:", data);
      return res.status(400).json({ error: "No se pudo generar Service Token", details: data });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error en Service Token:", error);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

export default router;
