/* ==========================================================================
   CYBORG INTERACTIVE ENGINE (IIT BOMBAY TECHFEST '26)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initCountdown();
  initTerminal();
  initRegistration();
  setupNavLinks();
});

/* ==========================================================================
   NEURAL NETWORK CANVAS LOGIC
   ========================================================================== */
function initCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxDistance = 120;
  const mouse = { x: null, y: null, radius: 180 };

  // Adjust canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  }

  // Particle Class Definition
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = (Math.random() - 0.5) * 0.8;
      this.radius = Math.random() * 2 + 1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 243, 255, 0.7)';
      ctx.fill();
    }

    update() {
      // Bounce boundaries
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      this.x += this.vx;
      this.y += this.vy;

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }
    }
  }

  function createParticles() {
    particles = [];
    // Calculate density based on screen dimensions
    const density = Math.floor((canvas.width * canvas.height) / 13000);
    const particleCount = Math.min(Math.max(density, 40), 120);
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          // Fade connection line based on proximity
          const alpha = (1 - dist / maxDistance) * 0.18;
          ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      // Draw connection lines to mouse cursor
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius - 20) {
          const alpha = (1 - dist / (mouse.radius - 20)) * 0.25;
          ctx.strokeStyle = `rgba(255, 0, 85, ${alpha})`; // Pink glow to mouse
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }

  // Mouse Listeners
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resizeCanvas);

  resizeCanvas();
  animate();
}


/* ==========================================================================
   LIVE COUNTDOWN CALIBRATOR
   ========================================================================== */
function initCountdown() {
  // Set Techfest Launch date: December 18, 2026, 10:00:00 AM
  const targetDate = new Date('2026-12-18T10:00:00').getTime();

  function updateClock() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      clearInterval(timerId);
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('minutes').innerText = '00';
      document.getElementById('seconds').innerText = '00';
      const label = document.querySelector('.countdown-label');
      if (label) label.innerText = 'SYSTEMS LIVE / PROTOCOLS ACTIVE';
      return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(d).padStart(2, '0');
    document.getElementById('hours').innerText = String(h).padStart(2, '0');
    document.getElementById('minutes').innerText = String(m).padStart(2, '0');
    document.getElementById('seconds').innerText = String(s).padStart(2, '0');
  }

  const timerId = setInterval(updateClock, 1000);
  updateClock();
}

/* ==========================================================================
   INTERACTIVE COMMAND TERMINAL
   ========================================================================== */
let terminalLogs = [];
const consoleLinesMax = 50;

function initTerminal() {
  const inputField = document.getElementById('console-input');
  const bodyField = document.getElementById('console-body');
  if (!inputField || !bodyField) return;

  // Add event listener for commands
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const commandText = inputField.value.trim();
      inputField.value = '';
      if (commandText) {
        processCommand(commandText);
      }
    }
  });

  // Keep terminal logs synced
  terminalLogs = Array.from(bodyField.querySelectorAll('.terminal-line')).map(l => l.outerHTML);
}

function printToTerminal(text, type = 'system') {
  const bodyField = document.getElementById('console-body');
  const promptLine = bodyField.querySelector('.terminal-prompt-line');
  if (!bodyField || !promptLine) return;

  const newLine = document.createElement('div');
  newLine.className = `terminal-line ${type}`;
  newLine.innerHTML = text;

  // Insert before the input prompt line
  bodyField.insertBefore(newLine, promptLine);

  // Auto-scroll to bottom
  bodyField.scrollTop = bodyField.scrollHeight;

  // Cap lines to prevent memory bloat
  const currentLines = bodyField.querySelectorAll('.terminal-line');
  if (currentLines.length > consoleLinesMax) {
    currentLines[0].remove();
  }
}

function processCommand(rawCmd) {
  const args = rawCmd.toLowerCase().split(' ');
  const cmd = args[0];

  // Print echo user input first
  printToTerminal(`<span class="prompt-prefix">guest@tf26:~$</span> ${rawCmd}`, 'system');

  switch (cmd) {
    case 'help':
      printToTerminal('----------------------------------------------------', 'system');
      printToTerminal('CYBORG NEURAL TERMINAL SHELL PROTOCOLS AVAILABLE:', 'warning');
      printToTerminal('  <strong>help</strong>        - Display all active control commands.', 'success');
      printToTerminal('  <strong>status</strong>      - Scan local processor and neural system load.', 'success');
      printToTerminal('  <strong>events</strong>      - Query techfest synergy sector codes.', 'success');
      printToTerminal('  <strong>scan</strong>        - Run deep cyber-diagnostic scanner logs.', 'success');
      printToTerminal('  <strong>register</strong>    - Access the sync link registration directives.', 'success');
      printToTerminal('  <strong>hack</strong>        - Interface directly with outer grid nodes.', 'success');
      printToTerminal('  <strong>clear</strong>       - Erase terminal logs from visual monitors.', 'success');
      printToTerminal('----------------------------------------------------', 'system');
      break;

    case 'clear':
      const bodyField = document.getElementById('console-body');
      const lines = bodyField.querySelectorAll('.terminal-line');
      lines.forEach(l => l.remove());
      break;

    case 'status':
      printToTerminal('Scanning neural linkages...', 'system');
      setTimeout(() => {
        const load = Math.floor(Math.random() * 20) + 15;
        const temp = Math.floor(Math.random() * 10) + 38;
        printToTerminal(`SYSTEM LOAD: ${load}% | TEMP: ${temp}°C | NODE CLUSTER: IN-104`, 'success');
        printToTerminal('NEURAL BANDWIDTH: 4.8 Gbps (100% Signal Integrity)', 'success');
        printToTerminal('ENHANCEMENTS CALIBRATION: OPTIMAL', 'success');
      }, 300);
      break;

    case 'events':
      printToTerminal('QUERYING DATA BASES...', 'system');
      setTimeout(() => {
        printToTerminal('SECTOR-01: ROBOWARS (Heavy armor kinetic combat arena)', 'warning');
        printToTerminal('SECTOR-02: CODING BRAWL (High speed cognitive compiling decathlon)', 'warning');
        printToTerminal('SECTOR-03: AEROSPECTRA (Autonomous flying drone drone trials)', 'warning');
        printToTerminal('Target Sector Delta (Sync Protocol) to register credentials.', 'system');
      }, 400);
      break;

    case 'scan':
      printToTerminal('INITIATING DIAGNOSTIC GRID SCAN...', 'warning');
      let count = 0;
      const interval = setInterval(() => {
        count += 25;
        printToTerminal(`Calibrating grid nodes... ${count}%`, 'system');
        if (count >= 100) {
          clearInterval(interval);
          printToTerminal('[SUCCESS] Grid scan complete. 0 system errors found.', 'success');
        }
      }, 200);
      break;

    case 'register':
      printToTerminal('REGISTRATION DIRECTIVE: Scroll down to Sector Delta.', 'system');
      printToTerminal('Enter your cyborg credentials to synthesize a link pass.', 'system');
      break;

    case 'hack':
      printToTerminal('BYPASSING FIREWALL GRIDS...', 'danger');
      setTimeout(() => {
        printToTerminal('ROOT ACCESS GRANTED: Welcome, Overseer.', 'danger');
        printToTerminal('ACCESS CODE: IITB_TECHFEST_CYBORG_SYS_ACCESS', 'danger');
        document.body.style.textShadow = '0 0 2px var(--primary-cyan)';
      }, 600);
      break;

    default:
      printToTerminal(`Command error: "${cmd}" is not a recognized protocol directive. Type "help".`, 'danger');
      break;
  }
}

/* ==========================================================================
   CYBORG ID/PASS SYNTHESIS LOGIC
   ========================================================================== */
function initRegistration() {
  const form = document.getElementById('registration-form');
  const placeholder = document.getElementById('pass-placeholder');
  const result = document.getElementById('pass-result');
  const downloadBtn = document.getElementById('download-pass-btn');
  
  if (!form || !placeholder || !result) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Fetch fields
    const aliasInput = document.getElementById('input-alias').value.trim();
    const implantSelect = document.getElementById('select-implant').value;
    const collectiveSelect = document.getElementById('select-collective').value;

    if (!aliasInput || !implantSelect || !collectiveSelect) {
      alert('Implant sync failed: Please complete all inputs.');
      return;
    }

    // Synthesize credentials
    document.getElementById('card-alias').innerText = aliasInput;
    document.getElementById('card-implant').innerText = implantSelect;
    document.getElementById('card-affinity').innerText = collectiveSelect;

    // Generate random serial and barcode info
    const randSerial = 'TF-' + Math.floor(1000 + Math.random() * 9000) + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const randBarcode = Math.floor(1000000000000 + Math.random() * 9000000000000);

    document.getElementById('card-serial').innerText = randSerial;
    document.getElementById('card-barcode-text').innerText = randBarcode;

    // Toggle panels
    placeholder.style.display = 'none';
    result.style.display = 'block';

    // Log registration in terminal console
    printToTerminal(`[SYNC COMPLETE] Registered Alias: ${aliasInput}`, 'success');
    printToTerminal(`Calibrating ${implantSelect} inside ${collectiveSelect}...`, 'system');
  });

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // Simulate download sequence
      const originalText = downloadBtn.innerText;
      downloadBtn.innerText = 'SYNTHESIZING PASS CHIP...';
      downloadBtn.disabled = true;
      downloadBtn.style.opacity = '0.7';

      setTimeout(() => {
        downloadBtn.innerText = 'PASS DOWNLOADED';
        downloadBtn.style.borderColor = 'var(--accent-pink)';
        downloadBtn.style.color = 'var(--accent-pink)';
        
        // Print message in terminal
        printToTerminal('[SYSTEM] Sync Card downloaded successfully to host downloads sector.', 'success');

        setTimeout(() => {
          downloadBtn.innerText = originalText;
          downloadBtn.disabled = false;
          downloadBtn.style.opacity = '1';
          downloadBtn.style.borderColor = 'var(--primary-cyan)';
          downloadBtn.style.color = 'var(--primary-cyan)';
        }, 2000);
      }, 1500);
    });
  }
}

/* ==========================================================================
   NAVIGATION HELPER
   ========================================================================== */
function setupNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link, #sync-btn, #diagnostics-btn');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}
