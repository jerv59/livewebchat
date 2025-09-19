// ==============================================
// app.js - Click to Call con Webex Calling SDK
// ==============================================

// =======================
// 🔹 Función: Obtener token dinámico desde backend en Render
// =======================
async function getToken() {
  try {
    const response = await fetch("https://click-to-call-backend.onrender.com/token");
    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error("❌ Error obteniendo token:", err);
    return null;
  }
}

// =======================
// 🔹 Inicializar Webex con token dinámico
// =======================
async function initCalling(userType) {
  const token = await getToken();
  if (!token) {
    alert("⚠️ No se pudo obtener un token válido. Revisa el backend en Render.");
    return;
  }

  // Inicializar SDK de Webex con token dinámico
  window.webex = window.Webex.init({
    credentials: {
      access_token: token
    }
  });

  console.log(`✅ Webex Calling inicializado para ${userType}`);
}

// =======================
// 🔹 Variables globales
// =======================
let activeCall = null;

// =======================
// 🔹 Función: Hacer llamada
// =======================
async function makeCall(destination) {
  if (!window.webex) {
    alert("⚠️ Webex no está inicializado todavía");
    return;
  }

  // Inicia la llamada
  activeCall = window.webex.phone.dial(destination);

  // Eventos de la llamada
  activeCall.on("connected", () => console.log("📞 Conectado con el agente"));
  activeCall.on("disconnected", () => {
    console.log("❌ Llamada finalizada");
    activeCall = null;
  });
}

// =======================
// 🔹 Controles de la llamada
// =======================

// Botón HABLAR CON AGENTE
document.getElementById("call-btn").addEventListener("click", async () => {
  await initCalling("cliente");

  // ⚠️ Cambia el destino SIP según tu configuración en Webex Calling
  makeCall("sip:agente@tuempresa.com");
});

// Botón MUTE
document.getElementById("mute-btn").addEventListener("click", () => {
  if (activeCall) {
    activeCall.mute().then(() => console.log("🔇 Micrófono silenciado"));
  } else {
    console.warn("⚠️ No hay llamada activa para silenciar");
  }
});

// Botón COLGAR
document.getElementById("hangup-btn").addEventListener("click", () => {
  if (activeCall) {
    activeCall.hangup().then(() => console.log("📴 Llamada colgada"));
    activeCall = null;
  } else {
    console.warn("⚠️ No hay llamada activa para colgar");
  }
});

