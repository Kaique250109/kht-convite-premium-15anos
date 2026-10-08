/* ================================================================
   KHT DIGITAL — Convite Interativo Demo 02
   CONFIGURAÇÕES: edite o objeto CONFIG para futuros clientes.
   ================================================================ */
const CONFIG = {
  eventName: '15 anos da Isabela (demonstração)',
  dateISO: '2027-06-19T19:30:00-03:00',
  // Deixe vazio para abrir o WhatsApp sem destinatário pré-definido.
  // Em um convite real, use o número autorizado do organizador,
  // apenas dígitos, com país e DDD. Ex.: '5511999999999'.
  whatsappNumber: '',
  mapURL: 'https://www.google.com/maps/search/?api=1&query=Parque%20Ibirapuera%2C%20S%C3%A3o%20Paulo'
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Entrar no convite: mantém o conteúdo acessível quando JS está desligado.
const entry = $('#entry');
const openButton = $('#openInvitation');
const heroTitle = $('#hero-title');
function enterInvitation() {
  entry.classList.add('is-hidden');
  entry.setAttribute('aria-hidden','true');
  document.body.classList.remove('locked');
  window.setTimeout(() => { entry.hidden = true; heroTitle?.setAttribute('tabindex', '-1'); heroTitle?.focus({preventScroll:true}); }, reduceMotion ? 0 : 760);
}
openButton?.addEventListener('click', enterInvitation);

// Navegação mobile.
const menuButton = $('#menuButton');
const mobileNav = $('#mobileNav');
function closeMenu() {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
}
menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = isOpen;
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
});
$$('#mobileNav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', e => {
  if (!mobileNav.hidden && !mobileNav.contains(e.target) && !menuButton.contains(e.target)) closeMenu();
});

// Indicador de rolagem.
const progress = $('#scrollProgress');
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}
window.addEventListener('scroll', updateProgress, {passive:true});
window.addEventListener('resize', updateProgress);
updateProgress();

// Animações de revelação.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(item => {
      if (item.isIntersecting) {
        item.target.classList.add('visible');
        revealObserver.unobserve(item.target);
      }
    });
  }, {rootMargin:'0px 0px -25px 0px', threshold:0.06});
  $$('.reveal').forEach(el => revealObserver.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('visible'));
}

// Contagem regressiva para a data do convite (demo).
const EVENT_TIME = new Date(CONFIG.dateISO).getTime();
function updateCountdown() {
  const left = Math.max(0, EVENT_TIME - Date.now());
  const days = Math.floor(left / 86400000);
  const hours = Math.floor(left / 3600000) % 24;
  const minutes = Math.floor(left / 60000) % 60;
  const seconds = Math.floor(left / 1000) % 60;
  $('#days').textContent = String(days).padStart(3, '0');
  $('#hours').textContent = String(hours).padStart(2, '0');
  $('#minutes').textContent = String(minutes).padStart(2, '0');
  $('#seconds').textContent = String(seconds).padStart(2, '0');
  if (!left) $('#countdownMessage').textContent = 'Chegou o grande dia! ✦';
}
updateCountdown();
window.setInterval(updateCountdown, 1000);
$('#mapsLink').href = CONFIG.mapURL;

// Janela de confirmação e preparação da mensagem do WhatsApp.
const rsvpModal = $('#rsvpModal');
const rsvpOpen = $('#openRsvp');
const rsvpClose = $('#closeRsvp');
const guestName = $('#guestName');
const form = $('#rsvpForm');
let previouslyFocused = null;
function showRsvp() {
  previouslyFocused = document.activeElement;
  rsvpModal.hidden = false;
  document.body.classList.add('locked');
  window.setTimeout(() => guestName.focus(), 30);
}
function hideRsvp() {
  rsvpModal.hidden = true;
  document.body.classList.remove('locked');
  previouslyFocused?.focus();
}
rsvpOpen?.addEventListener('click', showRsvp);
rsvpClose?.addEventListener('click', hideRsvp);
$$('[data-close-modal]').forEach(el => el.addEventListener('click', hideRsvp));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!rsvpModal.hidden) hideRsvp();
    else if (!mobileNav.hidden) closeMenu();
  }
  if (e.key === 'Tab' && !rsvpModal.hidden) {
    const focusables = $$('button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href]', rsvpModal).filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

form?.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const name = guestName.value.trim().replace(/\s+/g,' ');
  if (name.length < 2) {guestName.setCustomValidity('Digite pelo menos dois caracteres.'); guestName.reportValidity(); return;}
  guestName.setCustomValidity('');
  const attendance = $('#attendance').value;
  const qty = $('#guestCount').value;
  const message = [
    `Olá! Gostaria de responder ao convite de ${CONFIG.eventName}.`,
    `Nome: ${name}`,
    `Resposta: ${attendance}`,
    `Quantidade de pessoas: ${qty}`,
    '\nMensagem gerada em um modelo demonstrativo da KHT Digital.'
  ].join('\n');
  const number = CONFIG.whatsappNumber.replace(/\D/g,'');
  const whatsappURL = `https://api.whatsapp.com/send?${number ? `phone=${number}&` : ''}text=${encodeURIComponent(message)}`;
  // A pessoa decide se quer enviar a mensagem. Nenhum dado é salvo.
  window.open(whatsappURL, '_blank', 'noopener,noreferrer');
  hideRsvp();
  showToast('Mensagem preparada! Escolha o contato e confirme no WhatsApp.');
});
guestName?.addEventListener('input', () => guestName.setCustomValidity(''));

// Som ambiente original e opcional (sintetizado no próprio navegador).
// Não usa música de terceiros, não toca automaticamente.
const soundToggle = $('#soundToggle');
let soundContext = null;
let melodyTimer = null;
let isPlaying = false;
const notes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 392.0];
let noteIndex = 0;
function chime() {
  if (!soundContext || soundContext.state !== 'running') return;
  const osc = soundContext.createOscillator();
  const gain = soundContext.createGain();
  osc.type = 'sine';
  osc.frequency.value = notes[noteIndex++ % notes.length];
  gain.gain.setValueAtTime(0.0001, soundContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.028, soundContext.currentTime + .025);
  gain.gain.exponentialRampToValueAtTime(0.0001, soundContext.currentTime + .7);
  osc.connect(gain); gain.connect(soundContext.destination);
  osc.start(); osc.stop(soundContext.currentTime + .72);
}
function stopSound() {
  isPlaying = false;
  window.clearInterval(melodyTimer); melodyTimer = null;
  soundToggle.setAttribute('aria-pressed','false');
  soundToggle.setAttribute('aria-label', 'Ativar som ambiente');
  soundContext?.suspend().catch(()=>{});
}
soundToggle?.addEventListener('click', async () => {
  if (isPlaying) {stopSound();return;}
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextType) {showToast('Áudio não disponível neste navegador.');return;}
  try {
    soundContext ||= new AudioContextType();
    await soundContext.resume();
    isPlaying = true;
    soundToggle.setAttribute('aria-pressed','true');
    soundToggle.setAttribute('aria-label', 'Desativar som ambiente');
    chime();
    melodyTimer = window.setInterval(chime, 850);
  } catch { showToast('Não foi possível ativar o som.'); }
});
document.addEventListener('visibilitychange', () => {if (document.hidden && isPlaying) stopSound();});

let toastTimeout;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('visible'), 4700);
}
