const coverScreen = document.getElementById('coverScreen');
const videoScreen = document.getElementById('videoScreen');
const entryVideo = document.getElementById('entryVideo');
const stageThree = document.getElementById('stageThree');
const homeFlow = document.getElementById('homeFlow');
const countdownTimer = document.getElementById('countdownTimer');

let opened = false;
let countdownInterval = null;

function openInvitation(event) {
  if (opened) return;
  opened = true;

  event?.preventDefault?.();

  coverScreen.classList.add('fade-out');
  videoScreen.classList.add('active');
  videoScreen.setAttribute('aria-hidden', 'false');

  entryVideo.currentTime = 0;
  entryVideo.muted = false;
  const playPromise = entryVideo.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      entryVideo.muted = true;
      entryVideo.play().catch(() => {
        finishInvitationVideo();
      });
    });
  }

  coverScreen.addEventListener('transitionend', () => {
    coverScreen.classList.add('hidden');
  }, { once: true });
}

function finishInvitationVideo() {
  videoScreen.classList.remove('active');
  videoScreen.setAttribute('aria-hidden', 'true');
  entryVideo.pause();
  revealStageThree();
  setCountdown();
}

let lastVideoTap = 0;
function skipVideoOnDoubleTap(event) {
  if (entryVideo.paused) return;
  const now = Date.now();
  if (now - lastVideoTap < 400) {
    event.preventDefault();
    finishInvitationVideo();
    lastVideoTap = 0;
  } else {
    lastVideoTap = now;
  }
}

videoScreen.addEventListener('click', skipVideoOnDoubleTap);

function celebrateWithConfetti() {
  if (typeof confetti !== 'function') return;
  const colors = ['#c79d4b', '#f5efe0', '#7a2e2e', '#e8c874'];

  confetti({ particleCount: 70, spread: 65, startVelocity: 38, origin: { x: 0.12, y: 0.75 }, colors, scalar: 0.9, ticks: 220 });
  confetti({ particleCount: 70, spread: 65, startVelocity: 38, origin: { x: 0.88, y: 0.75 }, colors, scalar: 0.9, ticks: 220 });

  setTimeout(() => {
    confetti({ particleCount: 90, spread: 100, startVelocity: 42, origin: { x: 0.5, y: 0.35 }, colors, scalar: 1, ticks: 240 });
  }, 200);
}

let pictureConfettiInitialized = false;
function initPictureConfetti() {
  if (pictureConfettiInitialized) return;
  pictureConfettiInitialized = true;

  const pictureSections = ['pageOne', 'pageTwo', 'pageThree']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!pictureSections.length || typeof IntersectionObserver !== 'function' || !homeFlow) return;

  const fired = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !fired.has(entry.target.id)) {
        fired.add(entry.target.id);
        celebrateWithConfetti();
      }
    });
  }, { root: homeFlow, threshold: 0.6 });

  pictureSections.forEach((section) => observer.observe(section));
}

function setCountdown() {
  if (!countdownTimer) return;

  const target = new Date('2026-08-30T12:15:00+05:30');

  function updateCountdown() {
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) {
      clearInterval(countdownInterval);
      countdownTimer.innerHTML = `
        <div class="countdown-card"><span class="count-value">00</span><span class="count-label">Days</span></div>
        <div class="countdown-card"><span class="count-value">00</span><span class="count-label">Hours</span></div>
        <div class="countdown-card"><span class="count-value">00</span><span class="count-label">Minutes</span></div>
        <div class="countdown-card"><span class="count-value">00</span><span class="count-label">Seconds</span></div>
      `;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownTimer.innerHTML = `
      <div class="countdown-card"><span class="count-value">${String(days).padStart(2, '0')}</span><span class="count-label">Days</span></div>
      <div class="countdown-card"><span class="count-value">${String(hours).padStart(2, '0')}</span><span class="count-label">Hours</span></div>
      <div class="countdown-card"><span class="count-value">${String(minutes).padStart(2, '0')}</span><span class="count-label">Minutes</span></div>
      <div class="countdown-card"><span class="count-value">${String(seconds).padStart(2, '0')}</span><span class="count-label">Seconds</span></div>
    `;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function revealStageThree() {
  stageThree.classList.remove('hidden');
  document.body.classList.add('stage-active');
  window.scrollTo({ top: 0, behavior: 'auto' });

  if (window.gsap) {
    gsap.from(stageThree, { opacity: 0, duration: 1.2, ease: 'power3.out' });
  }

  initPictureConfetti();
}

coverScreen.addEventListener('click', openInvitation);
coverScreen.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') openInvitation(event);
});

entryVideo.addEventListener('ended', finishInvitationVideo);
entryVideo.addEventListener('error', finishInvitationVideo);
