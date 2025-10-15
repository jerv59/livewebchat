// 🚀 Backend principal para Webex WebCallback y correo (Brevo)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ===============================
// 🔧 Importar rutas
// ===============================
import guestRoutesModule from "./backend/routes/guest.js";
import callbackRoutesModule from "./backend/routes/callback.js";
import tokenRoutesModule from "./backend/routes/token.js";
import oauthRoutesModule from "./backend/routes/oauth.js";
import contactRoutesModule from "./backend/routes/contact.js";

// ✅ Compatibilidad ESM (Render a veces carga .default)
const guestRoutes = guestRoutesModule.default || guestRoutesModule;
const callbackRoutes = callbackRoutesModule.default || callbackRoutesModule;
const tokenRoutes = tokenRoutesModule.default || tokenRoutesModule;
const oauthRoutes = oauthRoutesModule.default || oauthRoutesModule;
const contactRoutes = contactRoutesModule.default || contactRoutesModule;

// ===============================
// ✅ Registrar rutas
// ===============================
app.use("/guest", guestRoutes);
app.use("/callback", callbackRoutes);
app.use("/token", tokenRoutes);
app.use("/oauth", oauthRoutes);
app.use("/contact", contactRoutes);

// ===============================
// 🔍 Ruta base
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 Backend Webex Callback + Email activo en Render");
});

// ===============================
// 🚀 Iniciar servidor
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en puerto ${PORT}`);
});
