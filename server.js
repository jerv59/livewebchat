// server.js
// Punto de entrada principal para Render

import express from "express";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Importar rutas desde /backend/routes
import guestRoutes from "./backend/routes/guest.js";
import callbackRoutes from "./backend/routes/callback.js";
import tokenRoutes from "./backend/routes/token.js";
import oauthRoutes from "./backend/routes/oauth.js";

const app = express();
app.use(express.json());

// ✅ Rutas organizadas por módulo
app.use("/guest", guestRoutes);       // Guest Token (opcional si usas Webex Chat Widget)
app.use("/callback", callbackRoutes); // Disparar llamadas Web Callback
app.use("/token", tokenRoutes);       // Generar access_token a partir de refresh_token
app.use("/oauth", oauthRoutes);       // Flujo OAuth inicial (solo se usa una vez)

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend Webex WebCallback activo y escuchando");
});

// Render expone PORT dinámico
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en puerto ${PORT}`);
});
