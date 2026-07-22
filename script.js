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

function initScratchCard() {
  const canvas = document.getElementById('scratchCanvas');
  const wrap = document.getElementById('scratchWrap');
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  const MIN_SCRATCH_DISTANCE = 14;
  let revealed = false;
  let scratching = false;
  let lastPoint = null;
  let moveCount = 0;
  let scratchDistance = 0;

  function paintOverlay(width, height) {
    ctx.globalCompositeOperation = 'source-over';
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#eecf86');
    gradient.addColorStop(0.5, '#c79d4b');
    gradient.addColorStop(1, '#a97c33');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 6;
    for (let x = -height; x < width; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(61, 37, 16, 0.9)';
    ctx.font = '600 13px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦ SCRATCH TO REVEAL ✦', width / 2, height / 2);
  }

  function sizeCanvas() {
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintOverlay(rect.width, rect.height);
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratchAt(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 34;
    ctx.beginPath();
    if (lastPoint) {
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      scratchDistance += Math.hypot(x - lastPoint.x, y - lastPoint.y);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x + 0.1, y + 0.1);
    }
    ctx.stroke();
    lastPoint = { x, y };
  }

  function checkRevealProgress() {
    if (revealed) return;
    const w = canvas.width;
    const h = canvas.height;
    if (!w || !h) return;
    const data = ctx.getImageData(0, 0, w, h).data;
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 24) {
      total++;
      if (data[i] < 40) cleared++;
    }
    if (total && cleared / total >= 0.6) {
      finishReveal();
    }
  }

  function finishReveal() {
    if (revealed) return;
    revealed = true;
    canvas.classList.add('scratch-canvas--cleared');
    celebrateWithConfetti();
    setTimeout(() => {
      canvas.style.display = 'none';
    }, 500);
  }

  function handleStart(event) {
    if (revealed) return;
    scratching = true;
    lastPoint = null;
    scratchDistance = 0;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      /* pointer capture unsupported, safe to ignore */
    }
    const { x, y } = getPoint(event);
    scratchAt(x, y);
    checkRevealProgress();
    event.preventDefault();
  }

  function handleMove(event) {
    if (!scratching || revealed) return;
    const { x, y } = getPoint(event);
    scratchAt(x, y);
    moveCount += 1;
    if (moveCount % 3 === 0) checkRevealProgress();
    event.preventDefault();
  }

  function handleEnd() {
    if (!revealed && scratching && scratchDistance >= MIN_SCRATCH_DISTANCE) {
      finishReveal();
    } else {
      checkRevealProgress();
    }
    scratching = false;
    lastPoint = null;
  }

  canvas.addEventListener('pointerdown', handleStart);
  canvas.addEventListener('pointermove', handleMove);
  canvas.addEventListener('pointerup', handleEnd);
  canvas.addEventListener('pointercancel', handleEnd);
  canvas.addEventListener('pointerleave', handleEnd);

  window.addEventListener('resize', () => {
    if (!revealed) sizeCanvas();
  });

  sizeCanvas();
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

initScratchCard();
