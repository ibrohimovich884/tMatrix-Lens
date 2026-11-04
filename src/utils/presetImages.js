export const PRESET_IMAGES = [
  {
    id: 'hacker',
    name: 'Cyber Operative',
    description: 'Kapushonli xaker va neon koʻzoynak',
    draw: (ctx, width, height) => {
      // Dark gradient background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width);
      bgGrad.addColorStop(0, '#102a1e');
      bgGrad.addColorStop(0.7, '#040d08');
      bgGrad.addColorStop(1, '#000000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Digital grid lines in background
      ctx.strokeStyle = 'rgba(0, 255, 120, 0.12)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Shoulders and Torso
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 1.05, width * 0.45, height * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hood silhouette
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(width * 0.28, height * 0.9);
      ctx.quadraticCurveTo(width * 0.22, height * 0.38, width * 0.5, height * 0.2);
      ctx.quadraticCurveTo(width * 0.78, height * 0.38, width * 0.72, height * 0.9);
      ctx.closePath();
      ctx.fill();

      // Inner hood shadow
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.moveTo(width * 0.34, height * 0.85);
      ctx.quadraticCurveTo(width * 0.3, height * 0.44, width * 0.5, height * 0.3);
      ctx.quadraticCurveTo(width * 0.7, height * 0.44, width * 0.66, height * 0.85);
      ctx.closePath();
      ctx.fill();

      // Face silhouette
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 0.54, width * 0.14, height * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(width * 0.45, height * 0.66, width * 0.1, height * 0.12);

      // Cyber Shades / Glasses
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(width * 0.37, height * 0.48, width * 0.26, height * 0.08, 6);
      ctx.fill();

      // Neon visor glare (super bright for 3D extrusion)
      const visorGrad = ctx.createLinearGradient(width * 0.37, 0, width * 0.63, 0);
      visorGrad.addColorStop(0, '#00ff88');
      visorGrad.addColorStop(0.5, '#ffffff');
      visorGrad.addColorStop(1, '#00e5ff');
      ctx.fillStyle = visorGrad;
      ctx.fillRect(width * 0.39, height * 0.5, width * 0.22, height * 0.035);

      // Chin / Lips highlight
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.63, width * 0.03, 0, Math.PI);
      ctx.fill();
    },
  },
  {
    id: 'skull',
    name: 'Cyber Skull',
    description: 'Kibernetik kalla suyagi',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#030508';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.46;

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, width * 0.45);
      glow.addColorStop(0, 'rgba(0, 255, 170, 0.25)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Cranium
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.26, Math.PI, 0, false);
      ctx.lineTo(cx + width * 0.22, cy + height * 0.18);
      ctx.lineTo(cx + width * 0.14, cy + height * 0.32);
      ctx.lineTo(cx - width * 0.14, cy + height * 0.32);
      ctx.lineTo(cx - width * 0.22, cy + height * 0.18);
      ctx.closePath();
      ctx.fill();

      // Forehead cyber plates
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.18, cy - height * 0.05);
      ctx.lineTo(cx, cy - height * 0.15);
      ctx.lineTo(cx + width * 0.18, cy - height * 0.05);
      ctx.stroke();

      // Eye sockets (deep hollows)
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(cx - width * 0.1, cy + height * 0.04, width * 0.07, height * 0.08, -0.15, 0, Math.PI * 2);
      ctx.ellipse(cx + width * 0.1, cy + height * 0.04, width * 0.07, height * 0.08, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Glowing ocular cores
      ctx.fillStyle = '#00ffcc';
      ctx.beginPath();
      ctx.arc(cx - width * 0.1, cy + height * 0.04, width * 0.025, 0, Math.PI * 2);
      ctx.arc(cx + width * 0.1, cy + height * 0.04, width * 0.025, 0, Math.PI * 2);
      ctx.fill();

      // Nose cavity
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.moveTo(cx, cy + height * 0.1);
      ctx.lineTo(cx + width * 0.035, cy + height * 0.16);
      ctx.lineTo(cx - width * 0.035, cy + height * 0.16);
      ctx.closePath();
      ctx.fill();

      // Teeth row
      ctx.fillStyle = '#cbd5e1';
      for (let i = -3; i <= 3; i++) {
        const tx = cx + i * (width * 0.035);
        ctx.fillRect(tx - width * 0.012, cy + height * 0.24, width * 0.024, height * 0.06);
      }
    },
  },
  {
    id: 'city',
    name: 'Neo Shinjuku',
    description: 'Neonli shahar panoramasi',
    draw: (ctx, width, height) => {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#05051a');
      skyGrad.addColorStop(0.5, '#16082f');
      skyGrad.addColorStop(0.8, '#2d0c45');
      skyGrad.addColorStop(1, '#05020c');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyber Sun
      const sunGrad = ctx.createRadialGradient(width * 0.5, height * 0.35, 10, width * 0.5, height * 0.35, width * 0.25);
      sunGrad.addColorStop(0, '#ff007f');
      sunGrad.addColorStop(0.6, '#ffaa00');
      sunGrad.addColorStop(1, 'rgba(255, 0, 128, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.35, width * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Sun scanlines
      ctx.fillStyle = '#16082f';
      for (let y = height * 0.26; y < height * 0.45; y += 8) {
        ctx.fillRect(width * 0.25, y, width * 0.5, 3);
      }

      // Distant buildings
      ctx.fillStyle = '#110b24';
      ctx.fillRect(width * 0.05, height * 0.45, width * 0.15, height * 0.55);
      ctx.fillRect(width * 0.22, height * 0.4, width * 0.16, height * 0.6);
      ctx.fillRect(width * 0.62, height * 0.42, width * 0.18, height * 0.58);
      ctx.fillRect(width * 0.82, height * 0.48, width * 0.14, height * 0.52);

      // Foreground main towers
      ctx.fillStyle = '#090514';
      ctx.fillRect(width * 0.36, height * 0.32, width * 0.28, height * 0.68);
      ctx.fillRect(width * 0.12, height * 0.52, width * 0.2, height * 0.48);
      ctx.fillRect(width * 0.68, height * 0.5, width * 0.22, height * 0.5);

      // Glowing windows
      ctx.fillStyle = '#00f7ff';
      for (let x = width * 0.39; x < width * 0.62; x += 14) {
        for (let y = height * 0.36; y < height * 0.9; y += 18) {
          if (Math.random() > 0.35) {
            ctx.fillStyle = Math.random() > 0.5 ? '#00f7ff' : '#ff007f';
            ctx.fillRect(x, y, 6, 8);
          }
        }
      }

      // Neon antenna spire
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.32);
      ctx.lineTo(width * 0.5, height * 0.18);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.18, 5, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    id: 'eye',
    name: 'Biometric Iris',
    description: 'Koʻz toʻr pardasi skaneri',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#03080e';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Outer HUD rings
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.42, 0, Math.PI * 2);
      ctx.stroke();

      // Segmented radar arc
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.38, 0.2, Math.PI * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.38, Math.PI * 1.1, Math.PI * 1.8);
      ctx.stroke();

      // Sclera / Eye shape
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.42, cy);
      ctx.quadraticCurveTo(cx, cy - height * 0.3, cx + width * 0.42, cy);
      ctx.quadraticCurveTo(cx, cy + height * 0.3, cx - width * 0.42, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Iris outer
      const irisGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, width * 0.2);
      irisGrad.addColorStop(0, '#001a1a');
      irisGrad.addColorStop(0.4, '#00ffaa');
      irisGrad.addColorStop(0.8, '#005544');
      irisGrad.addColorStop(1, '#00110e');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.18, 0, Math.PI * 2);
      ctx.fill();

      // Iris radial fiber rays
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * (width * 0.07), cy + Math.sin(angle) * (width * 0.07));
        ctx.lineTo(cx + Math.cos(angle) * (width * 0.17), cy + Math.sin(angle) * (width * 0.17));
        ctx.stroke();
      }

      // Pupil
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx, cy, width * 0.07, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx - width * 0.04, cy - width * 0.04, width * 0.025, 0, Math.PI * 2);
      ctx.fill();
    },
  },
];
