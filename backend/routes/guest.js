//genera token de invitado
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Generar Guest Token
router.post("/token", async (req, res) => {
  try {
    const { subject, displayName } = req.body;

    const response = await fetch("https://webexapis.com/v1/guests/token", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GUEST_ISSUER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ "subject": "WebPerson", "displayName": "Usuario Web" }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("❌ Error desde Webex Guest API:", data);
      return res.status(400).json({ error: "No se pudo generar Guest Token", details: data });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error generando Guest Token:", error);
    res.status(500).json({ error: "Error interno", details: error.message });
  }
});

export default router;
