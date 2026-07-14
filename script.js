const coverCard = document.getElementById('coverCard');
const videoOverlay = document.getElementById('videoOverlay');
const entryVideo = document.getElementById('entryVideo');
const stageThree = document.getElementById('stageThree');
const countdownTimer = document.getElementById('countdownTimer');
let opened = false;
let countdownInterval = null;

function initInvitationFlow() {
  if (!coverCard || !videoOverlay || !entryVideo || !stageThree) {
    return;
  }

  function openInvitation(event) {
    if (opened) return;
    if (event && event.type === 'pointerdown' && event.pointerType === 'mouse' && event.button !== 0) return;
    if (event && event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;

    event?.preventDefault?.();
    opened = true;
    coverCard.classList.add('faded');
    playAmbientBell();

    setTimeout(() => {
      showEntryVideo();
    }, 700);
  }

  const startFromCard = (event) => {
    if (event.target && coverCard.contains(event.target)) {
      openInvitation(event);
    }
  };

  coverCard.addEventListener('click', openInvitation, { passive: false });
  coverCard.addEventListener('pointerup', startFromCard, { passive: false });
  coverCard.addEventListener('touchend', startFromCard, { passive: false });
  coverCard.addEventListener('keydown', openInvitation);

  document.addEventListener('keydown', (event) => {
    const tag = event.target && event.target.tagName;
    if (opened) return;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (event.target && event.target.isContentEditable)) return;
    if (event.key === 'Enter' || event.key === ' ') {
      openInvitation(event);
    }
  });

  window.addEventListener('load', () => {
    try {
      coverCard.setAttribute('tabindex', '0');
      coverCard.focus({ preventScroll: true });
    } catch (error) {
      console.warn('Unable to auto-focus cover card', error);
    }
  });
}

function playAmbientBell() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.2);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 2.3);
  } catch (error) {
    console.warn('Audio not available', error);
  }
}

function playBackgroundAmbience() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = audioCtx.createGain();
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = 140;
    osc2.type = 'triangle';
    osc2.frequency.value = 210;
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;

    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    gain.gain.value = 0.008;
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    lfo.start();

    window.addEventListener('pagehide', () => {
      osc1.stop();
      osc2.stop();
      lfo.stop();
      audioCtx.close();
    }, { once: true });
  } catch (error) {
    console.warn('Background ambience unavailable', error);
  }
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
        <div class="countdown-card"><span class="count-value">00</span><span>Days</span></div>
        <div class="countdown-card"><span class="count-value">00</span><span>Hours</span></div>
        <div class="countdown-card"><span class="count-value">00</span><span>Minutes</span></div>
        <div class="countdown-card"><span class="count-value">00</span><span>Seconds</span></div>
      `;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    countdownTimer.innerHTML = `
      <div class="countdown-card"><span class="count-value">${String(days).padStart(2, '0')}</span><span>Days</span></div>
      <div class="countdown-card"><span class="count-value">${String(hours).padStart(2, '0')}</span><span>Hours</span></div>
      <div class="countdown-card"><span class="count-value">${String(minutes).padStart(2, '0')}</span><span>Minutes</span></div>
      <div class="countdown-card"><span class="count-value">${String(seconds).padStart(2, '0')}</span><span>Seconds</span></div>
    `;
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function revealStageThree() {
  stageThree.classList.remove('hidden');
  const coverScene = document.getElementById('coverScene');
  if (coverScene) {
    coverScene.style.display = 'none';
  }
  document.body.style.overflowX = 'hidden';
  document.body.style.overflowY = 'auto';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  playBackgroundAmbience();

  if (window.gsap) {
    gsap.from(stageThree, { opacity: 0, duration: 1.2, ease: 'power3.out' });
    gsap.from('.page-content h2, .page-content p, .countdown-shell', {
      opacity: 0,
      y: 36,
      stagger: 0.15,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2,
    });
  }
}

function showEntryVideo() {
  videoOverlay.classList.add('active');
  videoOverlay.setAttribute('aria-hidden', 'false');
  entryVideo.currentTime = 0;
  entryVideo.muted = true;
  const playPromise = entryVideo.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn('Video playback blocked:', error);
      revealStageThree();
      setCountdown();
    });
  }
}

function hideEntryVideo() {
  videoOverlay.classList.remove('active');
  videoOverlay.setAttribute('aria-hidden', 'true');
  entryVideo.pause();
  entryVideo.currentTime = 0;
}

entryVideo.addEventListener('error', () => {
  console.warn('Video failed to load. Showing wedding website instead.');
  hideEntryVideo();
  revealStageThree();
  setCountdown();
});

entryVideo.addEventListener('ended', () => {
  hideEntryVideo();
  revealStageThree();
  setCountdown();
});

entryVideo.addEventListener('play', () => {
  videoOverlay.setAttribute('aria-hidden', 'false');
});

entryVideo.addEventListener('pause', () => {
  videoOverlay.setAttribute('aria-hidden', 'true');
});

// Double-tap to skip video
let lastTap = 0;
videoOverlay.addEventListener('touchend', (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 300 && tapLength > 0) {
    // Double tap detected
    hideEntryVideo();
    revealStageThree();
    setCountdown();
  }
  lastTap = currentTime;
});

// Also support double-click on desktop
let clickCount = 0;
let clickTimeout;
videoOverlay.addEventListener('click', () => {
  clickCount++;
  if (clickCount === 2) {
    hideEntryVideo();
    revealStageThree();
    setCountdown();
    clickCount = 0;
  }
  clickTimeout = setTimeout(() => {
    clickCount = 0;
  }, 300);
});

initInvitationFlow();
