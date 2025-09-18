// timer.js
// Maneja el temporizador en la notificación de llamada

let callTimer;
let seconds = 0;

function startTimer() {
  stopTimer(); // Reinicia si ya había un timer corriendo
  seconds = 0;
  callTimer = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (callTimer) {
    clearInterval(callTimer);
    callTimer = null;
  }
}

function updateTimer() {
  seconds++;
  const timerEl = document.getElementById("timer");
  if (!timerEl) return;

  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  timerEl.textContent = `${mins}:${secs}`;
}

// DEPRECATED: soporte para múltiples timers (solo se usa uno actualmente)
// function startSecondTimer() { ... }
