// call-hooks.js
// Hooks y listeners para la experiencia de llamada

// Nota: estas funciones están asociadas a los eventos de Webex en app.js

function onIncomingCall(call) {
  console.log("Llamada entrante:", call);

  call.on("connected", () => {
    console.log("Entrante conectada");
    showNotification();
    startTimer();
  });

  call.on("disconnected", () => {
    console.log("Entrante finalizada");
    hideNotification();
    stopTimer();
  });

  call.answer();
}

// Listener global para llamadas entrantes
function setupIncomingCallListener() {
  if (!webexInstance) {
    console.warn("Webex no está inicializado");
    return;
  }

  webexInstance.calls.on("created", (call) => {
    if (call.direction === "incoming") {
      onIncomingCall(call);
    }
  });
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  console.log("Hooks cargados");
  // setupIncomingCallListener(); // DEPRECATED: no requerido en laboratorio (solo click-to-call)
});
