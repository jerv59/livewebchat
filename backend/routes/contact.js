// backend/routes/contact.js
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// POST /contact
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    // 🔐 Configuración SMTP de Brevo (Sendinblue)
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.BREVO_USER, // tu correo o usuario Brevo
        pass: process.env.BREVO_PASS, // tu API Key SMTP
      },
    });

    // 📩 Construcción del correo
    const mailOptions = {
      from: `"Clientes Support" <soporte@pocuc.com>`,
      to: "clientes.support@pocbancolombia.ucteamsidc.tigo.com.co",
      replyTo: email, // 👈 El agente podrá responder al usuario directamente
      subject: subject || `Nuevo mensaje de ${name}`,
      text: `Has recibido un nuevo mensaje:\n\nNombre: ${name}\nEmail: ${email}\n\nMensaje:\n${message}`,
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Correo enviado correctamente desde ${email}`);
    res.json({ success: true, message: "Correo enviado con éxito" });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({ error: "No se pudo enviar el correo" });
  }
});

export default router;
