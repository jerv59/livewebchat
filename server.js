// server.js es el archivo generado para conectar con Backend
//  /routes
//    guest.js        → generación de Guest Token (usuarios externos)
//    callback.js     → Web Callback
//    token.js        → generación de Service App Token (Call Token)
//  server.js         → punto de entrada Render


import express from "express";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import guestRoutes from './backend/routes/guest.js';
import callbackRoutes from './backend/routes/callback.js';
import tokenRoutes from './backend/routes/token.js';



const app = express();
app.use(express.json());

// ✅ Rutas organizadas por módulo
app.use("/guest", guestRoutes);
app.use("/callback", callbackRoutes);
app.use("/token", tokenRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend de Webex activo y escuchando");
});

// Render usa PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Backend escuchando en puerto ${PORT}`);
});
