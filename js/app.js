// app.js
// Control principal de la llamada Webex

let webexInstance;
let activeCall;
let isMuted = false;

async function initCalling(userType) {
  try {
    // Inicialización de Webex SDK
    webexInstance = window.webex = Webex.init({
      credentials: {
        access_token: "REEMPLAZAR_CON_TOKEN_DEVELOPER" // ⚠️ Cambia aquí tu token temporal
      }
    });

    console.log("Webex initialized for", userType);
  } catch (err) {
    console.error("Error initializing Webex:", err);
  }
}

async function initiateCall() {
  if (!webexInstance) {
    alert("Webex no está inicializado.");
    return;
  }

  try {
    const destination = "8737"; // Extensión configurada en Click-to-Call
    activeCall = await webexInstance.calls.create(destination);

    // Escuchar cambios en la llamada
    activeCall.on("connected", () => {
      console.log("Llamada conectada");
      showNotification();
      startTimer();
    });

    activeCall.on("disconnected", () => {
      console.log("Llamada terminada");
      hideNotification();
      stopTimer();
    });

    activeCall.on("error", (err) => {
      console.error("Error en llamada:", err);
    });
  } catch (err) {
    console.error("No se pudo iniciar la llamada:", err);
  }
}

function disconnectCall() {
  if (activeCall) {
    activeCall.hangup();
    activeCall = null;
    hideNotification();
    stopTimer();
  }
}

function toggleMute() {
  if (!activeCall) return;

  isMuted = !isMuted;
  activeCall.isMuted = isMuted;

  const muteBtn = document.querySelector(".mute i");
  if (isMuted) {
    muteBtn.classList.remove("fa-microphone-slash");
    muteBtn.classList.add("fa-microphone");
  } else {
    muteBtn.classList.remove("fa-microphone");
    muteBtn.classList.add("fa-microphone-slash");
  }
}

// Mostrar/ocultar notificación de llamada
function showNotification() {
  const notif = document.getElementById("callNotification");
  notif.classList.add("show-notification");
}
function hideNotification() {
  const notif = document.getElementById("callNotification");
  notif.classList.remove("show-notification");
}

// DEPRECATED: funciones para segundo canal de llamada (no implementado)
// function initiateSecondCall() { ... }

