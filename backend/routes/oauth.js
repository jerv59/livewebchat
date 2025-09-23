// backend/routes/oauth
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// 🚀 Inicio del flujo OAuth (opcional, por si quieres iniciar desde el backend)
router.get("/start", (req, res) => {
  const authorizeUrl = `https://webexapis.com/v1/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.OAUTH_REDIRECT_URI)}&scope=spark:kms cjp:user cjp:config_read cjp:config_write&state=xyz123`;

  res.redirect(authorizeUrl);
});

// 🔑 Callback de Webex (donde llega el code)
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("❌ No se recibió código de autorización");
  }

  try {
    // Intercambiar el "code" por un access_token y refresh_token
    const response = await fetch("https://webexapis.com/v1/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.errors) {
      console.error("❌ Error intercambiando code:", data);
      return res.status(400).json({ error: "No se pudo obtener token", details: data });
    }

    // Mostrar el refresh_token en pantalla (solo laboratorio!)
    res.send(`
      <h2>✅ Tokens generados correctamente</h2>
      <p><b>Access Token:</b> ${data.access_token}</p>
      <p><b>Refresh Token:</b> ${data.refresh_token}</p>
      <p><i>Copia el REFRESH_TOKEN y guárdalo en Render → Environment Variables</i></p>
    `);
  } catch (error) {
    console.error("❌ Error en callback:", error);
    res.status(500).send("Error interno del servidor");
  }
});

export default router;
