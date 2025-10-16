// backend/routes/contact.js
import express from "express";
//import nodemailer from "nodemailer";
import fetch from "node-fetch"; 

const router = express.Router();

// POST /contact
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

    try {
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY, // Usa API key (no SMTP key)
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: `${name}`, email: "soporte@pocuc.com" },
        to: [{ email: "clientes.support@pocbancolombia.ucteamsidc.tigo.com.co" }],
        replyTo: { email },
        subject: subject || `Nuevo mensaje de ${name}`,
        htmlContent: `
          <h3>Nuevo mensaje recibido desde la WEB</h3>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message}</p>
        `
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      throw new Error(errorData);
    }

    console.log(`✅ Correo enviado correctamente desde ${email}`);
    res.json({ success: true, message: "Correo enviado con éxito" });

  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
});


export default router;
