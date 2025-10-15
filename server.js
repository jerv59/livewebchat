// 🚀 Backend principal para Webex WebCallback en Render

import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(express.json());

// ===============================
// 🔧 Importar rutas de módulos
// ===============================
import guestRoutesModule from "./backend/routes/guest.js";
import callbackRoutesModule from "./backend/routes/callback.js";
import tokenRoutesModule from "./backend/routes/token.js";
import oauthRoutesModule from "./backend/routes/oauth.js";
import contactRoutesModule from "./backend/routes/contact.js";

// ✅ Compatibilidad con export default en Node ESM y Render
const guestRoutes = guestRoutesModule.default || guestRoutesModule;
const callbackRoutes = callbackRoutesModule.default || callbackRoutesModule;
const tokenRoutes = tokenRoutesModule.default || tokenRoutesModule;
const oauthRoutes = oauthRoutesModule.default || oauthRoutesModule;
const contactRoutes = contactRoutesModule.default || contactRoutesModule;

// ✅ Registrar rutas
app.use("/guest", guestRoutes);
app.use("/callback", callbackRoutes);
app.use("/token", tokenRoutes);
app.use("/oauth", oauthRoutes);
app.use("/contact", contactRoutes);

// ===============================
// 🔍 Ruta de prueba
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 Backend Webex WebCallback activo y escuchando");
});

// ===============================
// ✉️ Endpoint de contacto (Brevo SMTP directo)
// ===============================
app.post("/contact-form", async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!email || !mensaje) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_API_KEY,
      },
    });

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

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Correo enviado exitosamente." });
  } catch (error) {
    console.error("Error enviando correo:", error);
    res.status(500).json({ success: false, message: "Error al enviar el correo." });
  }
});

// ===============================
// 🚀 Arrancar servidor (Render)
// ===============================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en puerto ${PORT}`);
});
