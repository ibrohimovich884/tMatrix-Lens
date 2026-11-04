export const PRESET_IMAGES = [
  {
    id: 'romantic-lovers',
    name: 'Romantik Sevishganlar',
    tag: 'Tavsiya #1',
    description: 'Yulduzli osmon ostida sevimli insonlar va oy nuri',
    draw: (ctx, width, height) => {
      // Warm romantic sunset twilight background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0f051d');
      bgGrad.addColorStop(0.35, '#2e0854');
      bgGrad.addColorStop(0.65, '#831843');
      bgGrad.addColorStop(0.85, '#be123c');
      bgGrad.addColorStop(1, '#05020a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Soft romantic atmospheric haze
      const hazeGrad = ctx.createRadialGradient(cx, height * 0.45, 20, cx, height * 0.45, width * 0.45);
      hazeGrad.addColorStop(0, 'rgba(251, 113, 133, 0.35)');
      hazeGrad.addColorStop(0.6, 'rgba(217, 70, 239, 0.15)');
      hazeGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 0, width, height);

      // Luminous Golden Crescent / Moon in background (high 3D extrusion peak)
      const moonRadius = width * 0.19;
      const moonX = cx;
      const moonY = height * 0.35;

      const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.2, moonX, moonY, moonRadius * 1.8);
      moonGlow.addColorStop(0, '#fff1f2');
      moonGlow.addColorStop(0.3, '#fbcfe8');
      moonGlow.addColorStop(0.65, '#fb7185');
      moonGlow.addColorStop(1, 'rgba(251, 113, 133, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Sharp glowing moon disk
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Subtle warm moon texture
      ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
      ctx.beginPath();
      ctx.arc(moonX + 10, moonY - 10, moonRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Soft romantic floating glowing hearts in background
      const drawHeart = (hx, hy, size, alpha) => {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.fillStyle = `rgba(255, 228, 230, ${alpha})`;
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
        ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.15);
        ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
        ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      };

      drawHeart(cx, height * 0.28, 22, 0.85);
      drawHeart(cx - width * 0.28, height * 0.22, 14, 0.6);
      drawHeart(cx + width * 0.28, height * 0.24, 16, 0.65);
      drawHeart(cx - width * 0.15, height * 0.16, 11, 0.5);
      drawHeart(cx + width * 0.16, height * 0.14, 12, 0.55);

      // Romantic Couple Facing Each Other (Gentle artistic profiles)
      // Left Profile (She)
      ctx.fillStyle = '#0b0214';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(width * 0.42, height);
      ctx.lineTo(width * 0.42, height * 0.78);
      // Neck, chin, soft lips, graceful nose, brow
      ctx.quadraticCurveTo(width * 0.44, height * 0.72, width * 0.43, height * 0.65); // jaw
      ctx.lineTo(width * 0.46, height * 0.62); // chin
      ctx.lineTo(width * 0.465, height * 0.58); // bottom lip
      ctx.lineTo(width * 0.47, height * 0.55); // top lip
      ctx.lineTo(width * 0.49, height * 0.48); // nose tip
      ctx.lineTo(width * 0.44, height * 0.42); // eye bridge
      ctx.quadraticCurveTo(width * 0.46, height * 0.32, width * 0.35, height * 0.24); // forehead
      ctx.quadraticCurveTo(width * 0.2, height * 0.2, width * 0.1, height * 0.32); // hair top
      ctx.quadraticCurveTo(width * 0.05, height * 0.55, 0, height * 0.75); // flowing hair
      ctx.closePath();
      ctx.fill();

      // Glowing golden-rose rim light along her face (intense 3D elevation)
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(width * 0.42, height * 0.78);
      ctx.quadraticCurveTo(width * 0.44, height * 0.72, width * 0.43, height * 0.65);
      ctx.lineTo(width * 0.46, height * 0.62);
      ctx.lineTo(width * 0.465, height * 0.58);
      ctx.lineTo(width * 0.47, height * 0.55);
      ctx.lineTo(width * 0.49, height * 0.48);
      ctx.lineTo(width * 0.44, height * 0.42);
      ctx.quadraticCurveTo(width * 0.46, height * 0.32, width * 0.35, height * 0.24);
      ctx.stroke();

      // Right Profile (He)
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#06010a';
      ctx.beginPath();
      ctx.moveTo(width, height);
      ctx.lineTo(width * 0.58, height);
      ctx.lineTo(width * 0.58, height * 0.8);
      // Neck, jaw, chin, lips, strong nose, brow
      ctx.quadraticCurveTo(width * 0.56, height * 0.74, width * 0.57, height * 0.66);
      ctx.lineTo(width * 0.54, height * 0.63); // chin
      ctx.lineTo(width * 0.535, height * 0.59); // lower lip
      ctx.lineTo(width * 0.53, height * 0.56); // upper lip
      ctx.lineTo(width * 0.51, height * 0.47); // nose tip
      ctx.lineTo(width * 0.56, height * 0.41); // brow indentation
      ctx.quadraticCurveTo(width * 0.54, height * 0.3, width * 0.65, height * 0.22); // forehead
      ctx.lineTo(width * 0.85, height * 0.18); // hair
      ctx.quadraticCurveTo(width * 0.95, height * 0.45, width, height * 0.7);
      ctx.closePath();
      ctx.fill();

      // Glowing rim light along his face
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(width * 0.58, height * 0.8);
      ctx.quadraticCurveTo(width * 0.56, height * 0.74, width * 0.57, height * 0.66);
      ctx.lineTo(width * 0.54, height * 0.63);
      ctx.lineTo(width * 0.535, height * 0.59);
      ctx.lineTo(width * 0.53, height * 0.56);
      ctx.lineTo(width * 0.51, height * 0.47);
      ctx.lineTo(width * 0.56, height * 0.41);
      ctx.quadraticCurveTo(width * 0.54, height * 0.3, width * 0.65, height * 0.22);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Twinkling romantic stars in the night sky
      ctx.fillStyle = '#ffffff';
      const stars = [
        [0.18, 0.12, 2.5], [0.32, 0.08, 1.8], [0.5, 0.06, 2.2],
        [0.68, 0.09, 2.0], [0.82, 0.14, 2.4], [0.25, 0.22, 1.5],
        [0.75, 0.26, 1.6], [0.48, 0.52, 2.8], [0.52, 0.58, 2.2]
      ];
      stars.forEach(([sx, sy, sr]) => {
        ctx.beginPath();
        ctx.arc(width * sx, height * sy, sr, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },
  {
    id: 'romantic-heart',
    name: 'Sehrli Kristall Yurak',
    tag: 'Sevgi',
    description: 'Yulduzlar va nur toʻlqinlari bilan porlayotgan 3D yurak',
    draw: (ctx, width, height) => {
      // Deep space romantic background
      const bg = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.65);
      bg.addColorStop(0, '#2d063b');
      bg.addColorStop(0.5, '#150221');
      bg.addColorStop(1, '#050008');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height * 0.44;

      // Outer volumetric heart glow
      const hGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, width * 0.42);
      hGlow.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
      hGlow.addColorStop(0.6, 'rgba(217, 70, 239, 0.15)');
      hGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw large heart shape
      const hSize = width * 0.52;
      ctx.save();
      ctx.translate(cx, cy - hSize * 0.45);

      const heartGrad = ctx.createLinearGradient(-hSize / 2, 0, hSize / 2, hSize);
      heartGrad.addColorStop(0, '#f43f5e');
      heartGrad.addColorStop(0.35, '#fb7185');
      heartGrad.addColorStop(0.7, '#e11d48');
      heartGrad.addColorStop(1, '#9f1239');
      ctx.fillStyle = heartGrad;

      ctx.beginPath();
      const topCurveHeight = hSize * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -hSize / 2, 0, -hSize / 2, topCurveHeight);
      ctx.bezierCurveTo(-hSize / 2, (hSize + topCurveHeight) / 2, 0, hSize, 0, hSize * 1.08);
      ctx.bezierCurveTo(0, hSize, hSize / 2, (hSize + topCurveHeight) / 2, hSize / 2, topCurveHeight);
      ctx.bezierCurveTo(hSize / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();

      // Inner glowing core (super high Z extrusion)
      ctx.fillStyle = '#fff1f2';
      ctx.beginPath();
      ctx.ellipse(-hSize * 0.22, topCurveHeight * 0.8, hSize * 0.14, hSize * 0.08, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Golden contour
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.75)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();

      // Floating spark particles
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * (width * 0.38);
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        const r = 1 + Math.random() * 2.5;

        ctx.fillStyle = i % 2 === 0 ? '#fbcfe8' : '#fef08a';
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    id: 'trend-soft-eye',
    name: 'Mayin Romantik Koʻz',
    tag: 'Estetika',
    description: 'Iliq zumrad-tillarang jiloli, samimiy va mayin nigoh',
    draw: (ctx, width, height) => {
      // Warm dark chocolate/rose background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, '#1c0c16');
      bgGrad.addColorStop(0.6, '#0b0409');
      bgGrad.addColorStop(1, '#020003');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Soft warm skin tone surrounding
      const skinGrad = ctx.createRadialGradient(cx, cy, width * 0.25, cx, cy, width * 0.55);
      skinGrad.addColorStop(0, 'rgba(251, 191, 180, 0.25)');
      skinGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = skinGrad;
      ctx.fillRect(0, 0, width, height);

      // Smiling, almond-shaped eye contour
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.38, cy);
      ctx.bezierCurveTo(cx - width * 0.18, cy - height * 0.22, cx + width * 0.18, cy - height * 0.22, cx + width * 0.38, cy);
      ctx.bezierCurveTo(cx + width * 0.18, cy + height * 0.2, cx - width * 0.18, cy + height * 0.2, cx - width * 0.38, cy);
      ctx.closePath();
      ctx.clip();

      // Sclera with soft warm light
      const scleraGrad = ctx.createLinearGradient(0, cy - height * 0.2, 0, cy + height * 0.2);
      scleraGrad.addColorStop(0, '#b8b2ba');
      scleraGrad.addColorStop(0.35, '#f5eef0');
      scleraGrad.addColorStop(0.7, '#fffafb');
      scleraGrad.addColorStop(1, '#c9c2c6');
      ctx.fillStyle = scleraGrad;
      ctx.fill();

      // Warm Hazel / Golden Amber Iris
      const irisRadius = width * 0.19;
      const irisGrad = ctx.createRadialGradient(cx, cy, irisRadius * 0.1, cx, cy, irisRadius);
      irisGrad.addColorStop(0, '#241003');
      irisGrad.addColorStop(0.25, '#78350f');
      irisGrad.addColorStop(0.55, '#d97706');
      irisGrad.addColorStop(0.8, '#f59e0b');
      irisGrad.addColorStop(0.92, '#b45309');
      irisGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, irisRadius, 0, Math.PI * 2);
      ctx.fill();

      // Golden delicate rays
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const r1 = irisRadius * 0.32;
        const r2 = irisRadius * 0.9;
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.65)' : 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
        ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
        ctx.stroke();
      }

      // Pupil
      const pupilRadius = irisRadius * 0.32;
      ctx.fillStyle = '#0a0300';
      ctx.beginPath();
      ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
      ctx.fill();

      // Gentle specular highlights (loving catchlight)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx - pupilRadius * 0.6, cy - pupilRadius * 0.6, irisRadius * 0.15, irisRadius * 0.1, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx + pupilRadius * 0.6, cy + pupilRadius * 0.6, irisRadius * 0.06, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Graceful upper eyeliner & lashes
      ctx.strokeStyle = '#180a12';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - width * 0.39, cy);
      ctx.bezierCurveTo(cx - width * 0.18, cy - height * 0.22, cx + width * 0.18, cy - height * 0.22, cx + width * 0.4, cy - height * 0.02);
      ctx.stroke();

      // Soft eyelashes
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      for (let l = 0; l < 18; l++) {
        const t = l / 17;
        const lx = cx - width * 0.32 + t * (width * 0.65);
        const ly = cy - Math.sin(t * Math.PI) * (height * 0.21);
        const lashLen = 14 + Math.sin(t * Math.PI) * 16;
        const angle = -Math.PI * 0.5 + (t - 0.5) * 0.7;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + Math.cos(angle) * lashLen, ly + Math.sin(angle) * lashLen);
        ctx.stroke();
      }
    },
  },
  {
    id: 'romantic-rose',
    name: 'Atirgul & Shudring',
    tag: 'Gul',
    description: 'Qizil atirgul barglari va kristall shudring nurlari',
    draw: (ctx, width, height) => {
      ctx.fillStyle = '#090204';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Soft glow
      const glow = ctx.createRadialGradient(cx, cy, 30, cx, cy, width * 0.45);
      glow.addColorStop(0, 'rgba(225, 29, 72, 0.3)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Rose Petal Layers
      const drawPetal = (x, y, radX, radY, rot, fill) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot);
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.ellipse(0, 0, radX, radY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 228, 230, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      };

      // Outer petals
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        drawPetal(cx + Math.cos(angle) * 55, cy + Math.sin(angle) * 55, 65, 45, angle, '#9f1239');
      }

      // Middle petals
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + 0.3;
        drawPetal(cx + Math.cos(angle) * 35, cy + Math.sin(angle) * 35, 50, 35, angle, '#e11d48');
      }

      // Inner bud
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + 0.6;
        drawPetal(cx + Math.cos(angle) * 18, cy + Math.sin(angle) * 18, 32, 24, angle, '#f43f5e');
      }

      // Core swirl
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Dewdrops (high Z extrusion points)
      const drops = [
        [cx - 30, cy - 25, 4.5],
        [cx + 25, cy + 30, 3.8],
        [cx - 10, cy + 40, 3.2],
        [cx + 40, cy - 15, 3.5]
      ];
      drops.forEach(([dx, dy, dr]) => {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },
];
