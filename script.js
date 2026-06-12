// ── Profile Card Interactions ──

document.addEventListener('DOMContentLoaded', () => {


  // ── Ripple effect on buttons ──
  function addRipple(el) {
    el.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = el.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${e.clientX - rect.left - size / 2}px;
        top: ${e.clientY - rect.top  - size / 2}px;
        background: radial-gradient(circle, rgba(255,255,255,.35) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        transform: scale(0);
        animation: rippleAnim .6s ease-out forwards;
      `;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  }

  // Inject ripple keyframes once
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleAnim {
      to { transform: scale(2.5); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  document.querySelectorAll('.btn').forEach(addRipple);
  document.querySelectorAll('.content-link').forEach(addRipple);


  // ── Card tilt on mouse move ──
  const card = document.getElementById('profile-card');
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x    = (e.clientX - rect.left) / rect.width  - 0.5;  // -0.5 … 0.5
    const y    = (e.clientY - rect.top)  / rect.height - 0.5;

    card.style.transform = `
      perspective(800px)
      rotateY(${x * 5}deg)
      rotateX(${-y * 4}deg)
      translateZ(0)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .5s cubic-bezier(.22,.61,.36,1)';
    card.style.transform  = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });


  // ── Content-link placeholder navigation feedback ──
  document.querySelectorAll('.content-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const title = link.querySelector('.link-title').textContent.trim().replace('LIVE', '').trim();
      const note = document.createElement('div');
      note.textContent = `Opening ${title}…`;
      note.style.cssText = `
        position: fixed;
        bottom: 28px; left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: hsl(235, 20%, 18%);
        border: 1px solid hsla(320, 80%, 65%, .3);
        color: hsl(220, 10%, 90%);
        padding: 10px 24px;
        border-radius: 30px;
        font-family: 'Inter', sans-serif;
        font-size: .82rem;
        font-weight: 500;
        z-index: 9999;
        pointer-events: none;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px rgba(0,0,0,.4);
        opacity: 0;
        transition: opacity .3s, transform .3s;
      `;
      document.body.appendChild(note);
      requestAnimationFrame(() => {
        note.style.opacity   = '1';
        note.style.transform = 'translateX(-50%) translateY(0)';
      });
      setTimeout(() => {
        note.style.opacity   = '0';
        note.style.transform = 'translateX(-50%) translateY(10px)';
        setTimeout(() => note.remove(), 350);
      }, 1800);
    });
  });


  // ══════════════════════════════════════════════
  // ── Incoming Video Call Overlay ──
  // ══════════════════════════════════════════════
  const vcallOverlay = document.getElementById('vcall-overlay');
  const vcallClose   = document.getElementById('vcall-close');
  const vcallDecline = document.getElementById('vcall-decline');
  const vcallAnswer  = document.getElementById('vcall-answer');

  let autoDismissTimer = null;
  let repeatTimer      = null;

  /** Show the call overlay */
  function showCallOverlay() {
    vcallOverlay.classList.add('vcall-visible');

    // Auto-dismiss after 20 s if user ignores it
    clearTimeout(autoDismissTimer);
    autoDismissTimer = setTimeout(() => dismissCall('timeout'), 20000);
  }

  /** Hide the call overlay and schedule the next one */
  function dismissCall(reason) {
    clearTimeout(autoDismissTimer);
    vcallOverlay.classList.remove('vcall-visible');

    if (reason === 'answer') {
      showToast('📹 Joining video call with Sophia…', 'hsl(142, 70%, 55%)');
    } else if (reason === 'decline') {
      showToast('📵 Call declined', 'hsl(0, 70%, 60%)');
    }

    // Schedule the next ring in 15 s
    clearTimeout(repeatTimer);
    repeatTimer = setTimeout(showCallOverlay, 15000);
  }

  // Button listeners
  vcallClose.addEventListener('click',   () => dismissCall('close'));
  vcallDecline.addEventListener('click', () => dismissCall('decline'));
  vcallAnswer.addEventListener('click',  () => dismissCall('answer'));

  // Tap on backdrop dismisses
  vcallOverlay.addEventListener('click', (e) => {
    if (e.target === vcallOverlay || e.target.classList.contains('vcall-blur-bg')) {
      dismissCall('close');
    }
  });

  // First call appears after 3 s so user can see the card first
  repeatTimer = setTimeout(showCallOverlay, 3000);


  // ── Shared toast helper ──
  function showToast(msg, color = 'hsl(220, 10%, 90%)') {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 28px; left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: hsl(235, 20%, 18%);
      border: 1px solid hsla(320, 80%, 65%, .3);
      color: ${color};
      padding: 10px 24px;
      border-radius: 30px;
      font-family: 'Inter', sans-serif;
      font-size: .82rem;
      font-weight: 500;
      z-index: 20000;
      pointer-events: none;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
      opacity: 0;
      transition: opacity .3s, transform .3s;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 350);
    }, 2200);
  }

});

