document.getElementById('copyYear').textContent = new Date().getFullYear();

// Contact form
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  alert('Gracias por tu mensaje. Un asesor se comunicará pronto.');
  contactForm.reset();
});

// Live chat
const chatModal = document.getElementById('chatModal');
const openChatBtn = document.getElementById('open-chat');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const sendChat = document.getElementById('sendChat');

openChatBtn.addEventListener('click', ()=>chatModal.classList.toggle('open'));

function appendMessage(text, who='me'){
  const div = document.createElement('div');
  div.className = 'msg ' + who;
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  div.appendChild(bubble);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendChat.addEventListener('click', ()=>{
  const v = chatInput.value.trim();
  if(!v) return;
  appendMessage(v,'me');
  chatInput.value='';
  setTimeout(()=>appendMessage('Gracias por tu mensaje, un asesor responderá pronto.','them'),1000);
});
