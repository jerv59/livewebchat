// Punto de entrada principal para BAckend Render

import express from "express";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Importar rutas desde /backend/routes
import guestRoutes from "./backend/routes/guest.js";
import callbackRoutes from "./backend/routes/callback.js";
import tokenRoutes from "./backend/routes/token.js";
import oauthRoutes from "./backend/routes/oauth.js";
import contactRoutes from "./backend/routes/contact.js";


const app = express();
app.use(express.json());

// ✅ Rutas organizadas por módulo
app.use("/guest", guestRoutes);       // Guest Token (Webex Chat Widget)
app.use("/callback", callbackRoutes); // Disparar llamadas Web Callback
app.use("/token", tokenRoutes);       // Generar access_token a partir de refresh_token
app.use("/oauth", oauthRoutes);       // Flujo OAuth inicial (solo se usa una vez)
app.use("/contact", contactRoutes);  // Contacto via Email

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend Webex WebCallback activo y escuchando");
});

// ===============================
// ✉️ Endpoint para formulario de contacto
// ===============================
import nodemailer from "nodemailer";

app.post("/contact", async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!email || !mensaje) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    // Transportador usando SMTP de Brevo
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_API_KEY,
      },
    });

    // Configurar contenido del correo
    const mailOptions = {
      from: `"${nombre || "Usuario Web"}" <${process.env.BREVO_USER}>`,
      to: "clientes.support@pocbancolombia.ucteamsidc.tigo.com.co",
      replyTo: email,
      subject: asunto || "Nueva solicitud de contacto",
      text: `
Nombre: ${nombre}
Email: ${email}
Asunto: ${asunto}
Mensaje:
${mensaje}
      `,
    };

    // Enviar correo
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Correo enviado exitosamente." });
  } catch (error) {
    console.error("Error enviando correo:", error);
    res.status(500).json({ success: false, message: "Error al enviar el correo." });
  }
});



// Render expone PORT dinámico
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en puerto ${PORT}`);
});
