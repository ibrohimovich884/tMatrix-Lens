import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createBinaryGlyphAtlas } from '../utils/matrixAtlas.js';

// Pre-allocated math objects at module scope (Three.js skill directive: zero GC in render loop)
const _cameraTarget = new THREE.Vector3(0, 0, 0);
const _targetPos = new THREE.Vector3(0, 0, 160);
const _tempColor = new THREE.Color();
const _orbitPos = new THREE.Vector3();

export const MatrixScene = forwardRef(({
  settings,
  imageSource,
  imageWidth,
  imageHeight,
  onFpsUpdate,
  isCinematicOrbit,
  aspectRatioMode = 'free', // 'free' | '9:16' | '1:1'
}, ref) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const pointsRef = useRef(null);
  const shaderMaterialRef = useRef(null);
  const glyphAtlasRef = useRef(null);
  const animationFrameRef = useRef(0);
  const isSoftwareGlRef = useRef(false);

  // Video recording refs
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Sampling canvas for pixel processing & edge enhancement
  const sampleCanvasRef = useRef(null);

  // Settings ref to access inside loop without recreating listeners
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const isCinematicOrbitRef = useRef(isCinematicOrbit);
  isCinematicOrbitRef.current = isCinematicOrbit;

  // Camera transition state
  const cameraTransitionRef = useRef({
    active: false,
    targetPos: new THREE.Vector3(0, 0, 160),
    targetLook: new THREE.Vector3(0, 0, 0),
    speed: 0.08,
  });

  // Re-build geometry with Sharpness / Edge Relief & Resolution
  const buildGeometryFromImage = useCallback((source, srcW, srcH, res, sharpness = 1.0) => {
    if (!source) return null;

    if (!sampleCanvasRef.current) {
      sampleCanvasRef.current = document.createElement('canvas');
    }
    const canvas = sampleCanvasRef.current;

    // Aspect ratio preserving grid
    const aspect = (srcW && srcH) ? (srcW / srcH) : 1;
    let gridCols = Math.max(24, Math.min(220, Math.round(res)));
    let gridRows = Math.round(gridCols / aspect);
    if (gridRows > gridCols * 1.8) gridRows = Math.round(gridCols * 1.8);
    if (gridRows < gridCols * 0.35) gridRows = Math.round(gridCols * 0.35);

    canvas.width = gridCols;
    canvas.height = gridRows;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.clearRect(0, 0, gridCols, gridRows);
    ctx.drawImage(source, 0, 0, gridCols, gridRows);

    let imgData;
    try {
      imgData = ctx.getImageData(0, 0, gridCols, gridRows);
    } catch (e) {
      console.warn('Cannot read image data:', e);
      return null;
    }

    const totalParticles = gridCols * gridRows;
    const posFlat = new Float32Array(totalParticles * 3);
    const posExtruded = new Float32Array(totalParticles * 3);
    const posRain = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const luminances = new Float32Array(totalParticles);
    const edges = new Float32Array(totalParticles);
    const binaries = new Float32Array(totalParticles);
    const randoms = new Float32Array(totalParticles);
    const alphas = new Float32Array(totalParticles);

    const worldWidth = 120;
    const worldHeight = worldWidth / aspect;

    const data = imgData.data;
    let pIdx = 0;

    // Precalculate luminances for 2D edge detection (Sobel filter for sharpness & clarity)
    const rawLum = new Float32Array(gridCols * gridRows);
    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        const idx = (y * gridCols + x) * 4;
        const r = data[idx] / 255;
        const g = data[idx + 1] / 255;
        const b = data[idx + 2] / 255;
        const a = data[idx + 3] / 255;
        rawLum[y * gridCols + x] = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;
      }
    }

    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        const dIdx = (y * gridCols + x) * 4;
        const r = data[dIdx] / 255;
        const g = data[dIdx + 1] / 255;
        const b = data[dIdx + 2] / 255;
        const a = data[dIdx + 3] / 255;

        const lum = rawLum[y * gridCols + x];

        // Edge detection (horizontal & vertical gradient for crisp iris / pupil / eyelashes)
        const xPrev = Math.max(0, x - 1);
        const xNext = Math.min(gridCols - 1, x + 1);
        const yPrev = Math.max(0, y - 1);
        const yNext = Math.min(gridRows - 1, y + 1);

        const dx = (rawLum[y * gridCols + xNext] - rawLum[y * gridCols + xPrev]);
        const dy = (rawLum[yNext * gridCols + x] - rawLum[yPrev * gridCols + x]);
        const edgeMag = Math.sqrt(dx * dx + dy * dy);

        // Flat 2D position (centered)
        const nx = (x / (gridCols - 1) - 0.5) * worldWidth;
        const ny = (0.5 - y / (gridRows - 1)) * worldHeight;

        posFlat[pIdx * 3] = nx;
        posFlat[pIdx * 3 + 1] = ny;
        posFlat[pIdx * 3 + 2] = 0;

        // 3D Extruded position: Z modulated by luminance + edge sharpness boost
        const sharpBonus = edgeMag * (sharpness - 1.0) * 0.45;
        const effectiveZ = Math.max(0.0, lum + sharpBonus);

        posExtruded[pIdx * 3] = nx;
        posExtruded[pIdx * 3 + 1] = ny;
        posExtruded[pIdx * 3 + 2] = effectiveZ;

        // Matrix Rain position
        const colSeed = Math.sin(x * 12.9898) * 43758.5453;
        posRain[pIdx * 3] = nx + (Math.sin(x * 4.0) * 1.5);
        posRain[pIdx * 3 + 1] = ny;
        posRain[pIdx * 3 + 2] = (Math.sin(x * 0.8 + y * 0.2) * 20.0) + ((colSeed % 1) - 0.5) * 35.0;

        // Colors
        colors[pIdx * 3] = r;
        colors[pIdx * 3 + 1] = g;
        colors[pIdx * 3 + 2] = b;

        luminances[pIdx] = lum;
        edges[pIdx] = edgeMag;
        alphas[pIdx] = a;
        binaries[pIdx] = ((x ^ y) & 1) === 0 ? 0.0 : 1.0;
        randoms[pIdx] = Math.abs(Math.sin(x * 78.233 + y * 37.719));

        pIdx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posFlat, 3));
    geometry.setAttribute('aPosExtruded', new THREE.BufferAttribute(posExtruded, 3));
    geometry.setAttribute('aPosRain', new THREE.BufferAttribute(posRain, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aLuminance', new THREE.BufferAttribute(luminances, 1));
    geometry.setAttribute('aEdge', new THREE.BufferAttribute(edges, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aBinary', new THREE.BufferAttribute(binaries, 1));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));

    geometry.computeBoundingSphere();
    return geometry;
  }, []);

  // Update existing mesh with new geometry
  const updateMeshGeometry = useCallback((geometry) => {
    if (!geometry || !sceneRef.current || !shaderMaterialRef.current) return;

    if (pointsRef.current) {
      sceneRef.current.remove(pointsRef.current);
      if (pointsRef.current.geometry) {
        pointsRef.current.geometry.dispose();
      }
      pointsRef.current = null;
    }

    const points = new THREE.Points(geometry, shaderMaterialRef.current);
    points.frustumCulled = false;
    sceneRef.current.add(points);
    pointsRef.current = points;
  }, []);

  // Public imperative handles
  useImperativeHandle(ref, () => ({
    captureSnapshot: (highRes = false) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
      
      const renderer = rendererRef.current;
      const camera = cameraRef.current;
      const scene = sceneRef.current;

      if (highRes) {
        const prevRatio = renderer.getPixelRatio();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio * 2, 3));
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL('image/png');
        renderer.setPixelRatio(prevRatio);
        return dataUrl;
      }

      renderer.render(scene, camera);
      return renderer.domElement.toDataURL('image/png');
    },

    startRecordingVideo: (durationMs = 6000, onProgress, onComplete) => {
      if (!rendererRef.current) return;
      const canvas = rendererRef.current.domElement;
      
      try {
        const stream = canvas.captureStream(60);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }

        const options = mimeType ? { mimeType, videoBitsPerSecond: 8000000 } : {};
        const recorder = new MediaRecorder(stream, options);
        recordedChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: mimeType || 'video/webm' });
          if (onComplete) onComplete(blob);
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;

        const startTime = Date.now();
        const progressTimer = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
          if (onProgress) onProgress(pct);

          if (elapsed >= durationMs) {
            clearInterval(progressTimer);
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          }
        }, 100);

      } catch (err) {
        console.warn('Video record error:', err);
      }
    },

    stopRecordingVideo: () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    },

    resetCamera: (preset) => {
      if (!cameraRef.current || !controlsRef.current) return;
      cameraTransitionRef.current.active = true;
      const isMobile = window.innerWidth < 768;
      const targetY = isMobile ? 8 : 0;
      const camY = isMobile ? -5 : 0;

      switch (preset) {
        case 'front':
          cameraTransitionRef.current.targetPos.set(0, camY, isMobile ? 170 : 155);
          cameraTransitionRef.current.targetLook.set(0, targetY, 0);
          break;
        case 'isometric':
          cameraTransitionRef.current.targetPos.set(isMobile ? 70 : 80, isMobile ? 45 : 55, isMobile ? 120 : 105);
          cameraTransitionRef.current.targetLook.set(0, targetY, 0);
          break;
        case 'side':
          cameraTransitionRef.current.targetPos.set(130, 20, 60);
          cameraTransitionRef.current.targetLook.set(0, targetY, 0);
          break;
        case 'closeup':
          cameraTransitionRef.current.targetPos.set(0, isMobile ? 2 : 0, isMobile ? 80 : 70);
          cameraTransitionRef.current.targetLook.set(0, targetY, 0);
          break;
        case 'reels':
          cameraTransitionRef.current.targetPos.set(30, 15, isMobile ? 140 : 130);
          cameraTransitionRef.current.targetLook.set(0, targetY, 0);
          break;
        default:
          cameraTransitionRef.current.targetPos.set(0, camY, isMobile ? 170 : 155);
          cameraTransitionRef.current.targetLook.set(0, targetY, 0);
          break;
      }
    },

    updateImageSource: (source, width, height) => {
      const geom = buildGeometryFromImage(
        source, 
        width, 
        height, 
        settingsRef.current.resolution,
        settingsRef.current.sharpness || 1.0
      );
      updateMeshGeometry(geom);
    },
  }), [buildGeometryFromImage, updateMeshGeometry]);

  // Main Three.js Scene Setup (Mounts once)
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();
    isSoftwareGlRef.current = isSoftwareGl;

    // Scene setup: deep rich black backdrop for glowing 3D relief
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070a);
    scene.fog = new THREE.FogExp2(0x06070a, 0.0022);
    sceneRef.current = scene;

    const isMobile = width < 768;

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    if (isMobile) {
      camera.position.set(0, -5, 170);
    } else {
      camera.position.set(0, 0, 155);
    }
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.minDistance = 20;
    controls.maxDistance = 350;
    controls.maxPolarAngle = Math.PI * 0.95;
    if (isMobile) {
      controls.target.set(0, 8, 0);
    }
    controlsRef.current = controls;

    // Binary Glyph Atlas (Canvas 0 & 1)
    const glyphAtlas = createBinaryGlyphAtlas();
    glyphAtlasRef.current = glyphAtlas;

    // Custom GLSL Shaders for 3D Particles / Pixels / Volumetric Mesh
    const vertexShader = `
      uniform float uTime;
      uniform float uMorphProgress;
      uniform float uDepthExtrusion;
      uniform float uPointSize;
      uniform int uMode; // 0: Hologram Relief, 1: Matrix Rain, 2: Waves
      uniform float uWaveIntensity;
      uniform float uRainSpeed;
      uniform float uPixelRatio;
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uAlivePulse;
      uniform float uLaserProgress;
      uniform float uSharpness;

      attribute vec3 aPosExtruded;
      attribute vec3 aPosRain;
      attribute vec3 aColor;
      attribute float aLuminance;
      attribute float aEdge;
      attribute float aAlpha;
      attribute float aBinary;
      attribute float aRandom;

      varying vec3 vColor;
      varying float vLuminance;
      varying float vEdge;
      varying float vAlpha;
      varying float vBinary;
      varying float vRandom;
      varying float vDist;
      varying float vLaserBeam;

      void main() {
        vColor = aColor;
        vLuminance = aLuminance;
        vEdge = aEdge;
        vAlpha = aAlpha;
        vBinary = aBinary;
        vRandom = aRandom;

        // Adjust luminance with brightness and contrast
        float adjLum = (aLuminance + uBrightness) * uContrast;
        adjLum = clamp(adjLum, 0.0, 1.0);

        // Target position based on active 3D mode
        vec3 targetPos = position;

        // Breathing / Alive micro-pulse on Z axis (organic depth breathing)
        float aliveZ = sin(uTime * 2.2 + position.y * 0.05) * (uAlivePulse * 2.2);

        // Edge micro-extrusion for sharpness (sharp iris, lashes, pupil edge)
        float edgeBoost = aEdge * (uSharpness - 1.0) * 8.0;

        if (uMode == 0) {
          // 3D Volumetric Photorelief
          targetPos = vec3(position.xy, (adjLum * uDepthExtrusion) + aliveZ + edgeBoost);
        } else if (uMode == 1) {
          // Matrix Rain: streaming down vertically
          vec3 rPos = aPosRain;
          float cycle = mod(rPos.y - uTime * (25.0 + uRainSpeed * 40.0) * (0.8 + aRandom * 0.4), 140.0) - 70.0;
          rPos.y = cycle;
          targetPos = rPos;
        } else if (uMode == 2) {
          // Harmonic Heartbeat / Sine Ripples
          float distFromCenter = length(position.xy);
          float waveZ = sin(distFromCenter * 0.12 - uTime * 4.0) * (uWaveIntensity * 16.0);
          targetPos = vec3(position.xy, (adjLum * uDepthExtrusion) + waveZ + aliveZ);
        }

        // Morph between 2D flat image and target 3D configuration
        vec3 finalPos = mix(position, targetPos, uMorphProgress);

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Laser scan line distance calculation (-60 to +60 in Y)
        float laserY = (uLaserProgress * 140.0) - 70.0;
        float distToLaser = abs(finalPos.y - laserY);
        vLaserBeam = exp(-distToLaser * distToLaser / 32.0);

        // Perspective size attenuation
        float pointAtten = 320.0 / -mvPosition.z;
        float lumScale = 0.88 + adjLum * 0.45;
        gl_PointSize = uPointSize * uPixelRatio * pointAtten * lumScale;
        gl_PointSize = clamp(gl_PointSize, 4.0, 110.0);

        vDist = -mvPosition.z;
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform sampler2D uAtlas;
      uniform float uTime;
      uniform float uMorphProgress;
      uniform int uTheme; 
      // 0: True RGB
      // 1: Pure White
      // 2: Matrix Green
      // 3: Amber Gold
      // 4: Cyber Cyan
      // 5: Cyber Red
      // 6: Custom Color
      // 7: Romantic Rose / Sunset
      // 8: Sapphire Dream

      uniform vec3 uCustomColor;
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uThreshold;
      uniform int uParticleStyle; // 0: Prism Pixels (Square), 1: Glow Spheres, 2: Matrix 0/1, 3: Diamond Crystals
      uniform float uLaserActive;

      varying vec3 vColor;
      varying float vLuminance;
      varying float vEdge;
      varying float vAlpha;
      varying float vBinary;
      varying float vRandom;
      varying float vDist;
      varying float vLaserBeam;

      void main() {
        if (vAlpha < 0.05) discard;

        // Apply real-time brightness & contrast
        float adjLum = (vLuminance + uBrightness) * uContrast;
        adjLum = clamp(adjLum, 0.0, 1.0);

        // Point coordinates centered [-0.5, 0.5]
        vec2 p = gl_PointCoord - vec2(0.5);

        float shapeAlpha = 1.0;

        if (uParticleStyle == 0) {
          // 0: PRISM PIXELS (Square micro-cube pixels with crisp bevel edge)
          vec2 d = abs(p);
          float maxD = max(d.x, d.y);
          if (maxD > 0.48) discard;
          // Soft micro bevel border
          shapeAlpha = 1.0 - smoothstep(0.42, 0.48, maxD) * 0.35;
        } else if (uParticleStyle == 1) {
          // 1: GLOW SPHERES (Luminous soft star / circular bokeh points)
          float r = length(p);
          if (r > 0.5) discard;
          shapeAlpha = smoothstep(0.5, 0.05, r);
        } else if (uParticleStyle == 2) {
          // 2: MATRIX 0 / 1 GLYPHS (Monospace glyph atlas)
          float activeGlyph = adjLum >= uThreshold ? 1.0 : 0.0;
          float uOffset = activeGlyph > 0.5 ? 0.5 : 0.0;
          vec2 atlasCoord = vec2(uOffset + gl_PointCoord.x * 0.5, gl_PointCoord.y);
          vec4 glyphTex = texture2D(uAtlas, atlasCoord);

          shapeAlpha = mix(1.0, glyphTex.a, smoothstep(0.04, 0.35, uMorphProgress));
          if (shapeAlpha < 0.06) discard;
        } else if (uParticleStyle == 3) {
          // 3: DIAMOND CRYSTALS (Rotated 45-degree diamond prisms)
          float d = abs(p.x) + abs(p.y);
          if (d > 0.52) discard;
          shapeAlpha = 1.0 - smoothstep(0.42, 0.52, d) * 0.4;
        }

        // Clean authentic color shading
        vec3 baseColor;

        if (uTheme == 0) {
          // 0: TRUE RGB - 100% authentic unadulterated photo colors (clean skin tones, iris hues, zero green/blue tint!)
          vec3 adjRGB = (vColor + vec3(uBrightness)) * uContrast;
          baseColor = clamp(adjRGB, 0.0, 1.0);
        } else if (uTheme == 1) {
          // 1: PURE WHITE - Monochromatic silver / platinum
          baseColor = vec3(0.35 + adjLum * 0.65);
        } else if (uTheme == 2) {
          // 2: CLASSIC MATRIX GREEN
          vec3 greenDark = vec3(0.02, 0.4, 0.12);
          vec3 greenBright = vec3(0.0, 1.0, 0.38);
          baseColor = mix(greenDark, greenBright, adjLum);
          if (adjLum > 0.85) baseColor = mix(baseColor, vec3(0.9, 1.0, 0.9), (adjLum - 0.85) * 4.0);
        } else if (uTheme == 3) {
          // 3: AMBER GOLD / CRT
          vec3 amberDark = vec3(0.4, 0.16, 0.0);
          vec3 amberBright = vec3(1.0, 0.75, 0.12);
          baseColor = mix(amberDark, amberBright, adjLum);
          if (adjLum > 0.85) baseColor = mix(baseColor, vec3(1.0, 0.96, 0.8), (adjLum - 0.85) * 4.0);
        } else if (uTheme == 4) {
          // 4: CYBER CYAN / NEON BLUE
          vec3 cyanDark = vec3(0.0, 0.22, 0.45);
          vec3 cyanBright = vec3(0.0, 0.88, 1.0);
          baseColor = mix(cyanDark, cyanBright, adjLum);
        } else if (uTheme == 5) {
          // 5: CYBER RED
          vec3 redDark = vec3(0.35, 0.02, 0.06);
          vec3 redBright = vec3(1.0, 0.15, 0.25);
          baseColor = mix(redDark, redBright, adjLum);
        } else if (uTheme == 7) {
          // 7: ROMANTIC ROSE GOLD
          vec3 roseDark = vec3(0.35, 0.08, 0.22);
          vec3 roseBright = vec3(1.0, 0.55, 0.75);
          baseColor = mix(roseDark, roseBright, adjLum);
          if (adjLum > 0.8) baseColor = mix(baseColor, vec3(1.0, 0.9, 0.95), (adjLum - 0.8) * 5.0);
        } else if (uTheme == 8) {
          // 8: SAPPHIRE DREAM (Viral trend deep blue with gold sparks)
          vec3 sDark = vec3(0.01, 0.08, 0.28);
          vec3 sBright = vec3(0.12, 0.65, 1.0);
          baseColor = mix(sDark, sBright, adjLum);
          if (adjLum > 0.82) baseColor = mix(baseColor, vec3(0.9, 0.95, 1.0), (adjLum - 0.82) * 5.0);
        } else {
          // 6: CUSTOM COLOR PICKER
          baseColor = uCustomColor * (0.28 + adjLum * 0.72);
        }

        // Laser scan sweep illumination (gives a blazing neon rim as the scanner passes)
        if (uLaserActive > 0.01 && vLaserBeam > 0.05) {
          vec3 laserGlow = vec3(0.2, 0.9, 1.0) * (vLaserBeam * uLaserActive * 1.8);
          baseColor += laserGlow;
        }

        gl_FragColor = vec4(baseColor, shapeAlpha * vAlpha * (0.75 + adjLum * 0.25));
      }
    `;

    _tempColor.set(settings.customColor || '#00ff88');

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uAtlas: { value: glyphAtlas },
        uTime: { value: 0 },
        uMorphProgress: { value: settings.morphProgress },
        uDepthExtrusion: { value: settings.depthExtrusion },
        uPointSize: { value: settings.pointSize },
        uMode: { value: settings.mode === 'matrix-rain' ? 1 : settings.mode === 'waves' ? 2 : 0 },
        uWaveIntensity: { value: settings.waveIntensity },
        uRainSpeed: { value: settings.rainSpeed },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uBrightness: { value: settings.brightness },
        uContrast: { value: settings.contrast },
        uThreshold: { value: settings.threshold },
        uParticleStyle: { value: settings.particleStyle === 'glyphs' ? 2 : settings.particleStyle === 'spheres' ? 1 : settings.particleStyle === 'diamonds' ? 3 : 0 },
        uLaserProgress: { value: 0 },
        uLaserActive: { value: settings.laserActive ? 1.0 : 0.0 },
        uAlivePulse: { value: settings.alivePulse || 0.0 },
        uSharpness: { value: settings.sharpness || 1.0 },
        uTheme: {
          value: settings.theme === 'pure-white' ? 1
            : settings.theme === 'matrix-green' ? 2
            : settings.theme === 'amber-gold' ? 3
            : settings.theme === 'cyber-cyan' ? 4
            : settings.theme === 'red-alert' ? 5
            : settings.theme === 'custom' ? 6
            : settings.theme === 'romantic-rose' ? 7
            : settings.theme === 'sapphire-dream' ? 8
            : 0,
        },
        uCustomColor: { value: _tempColor },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    shaderMaterialRef.current = shaderMaterial;

    // Build initial geometry if imageSource is already present
    if (imageSource) {
      const initialGeom = buildGeometryFromImage(
        imageSource,
        imageWidth,
        imageHeight,
        settings.resolution,
        settings.sharpness || 1.0
      );
      if (initialGeom) {
        updateMeshGeometry(initialGeom);
      }
    }

    // Animation Loop with Three.js Software-GL guard
    let lastTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdate = performance.now();

    const tick = () => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      frameCount++;
      if (now - lastFpsUpdate >= 600) {
        const calculatedFps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
        if (onFpsUpdate) onFpsUpdate(calculatedFps);
        frameCount = 0;
        lastFpsUpdate = now;
      }

      const curSettings = settingsRef.current;

      // Update shader uniforms
      if (shaderMaterialRef.current) {
        const u = shaderMaterialRef.current.uniforms;
        u.uTime.value = now * 0.001;
        u.uMorphProgress.value = curSettings.morphProgress;
        u.uDepthExtrusion.value = curSettings.depthExtrusion;
        u.uPointSize.value = curSettings.pointSize;
        u.uMode.value = curSettings.mode === 'matrix-rain' ? 1 : curSettings.mode === 'waves' ? 2 : 0;
        u.uWaveIntensity.value = curSettings.waveIntensity;
        u.uRainSpeed.value = curSettings.rainSpeed;
        u.uBrightness.value = curSettings.brightness;
        u.uContrast.value = curSettings.contrast;
        u.uThreshold.value = curSettings.threshold;
        u.uParticleStyle.value = curSettings.particleStyle === 'glyphs' ? 2 : curSettings.particleStyle === 'spheres' ? 1 : curSettings.particleStyle === 'diamonds' ? 3 : 0;
        u.uAlivePulse.value = curSettings.alivePulse || 0.0;
        u.uSharpness.value = curSettings.sharpness || 1.0;
        u.uLaserActive.value = curSettings.laserActive ? 1.0 : 0.0;

        // Laser scan sweep cycle
        if (curSettings.laserActive) {
          u.uLaserProgress.value = (Math.sin(now * 0.002) + 1.0) * 0.5;
        }

        u.uTheme.value = curSettings.theme === 'pure-white' ? 1
          : curSettings.theme === 'matrix-green' ? 2
          : curSettings.theme === 'amber-gold' ? 3
          : curSettings.theme === 'cyber-cyan' ? 4
          : curSettings.theme === 'red-alert' ? 5
          : curSettings.theme === 'custom' ? 6
          : curSettings.theme === 'romantic-rose' ? 7
          : curSettings.theme === 'sapphire-dream' ? 8
          : 0;

        if (curSettings.theme === 'custom' && curSettings.customColor) {
          _tempColor.set(curSettings.customColor);
          u.uCustomColor.value.copy(_tempColor);
        }
      }

      // Camera scripted smooth transitions
      if (cameraTransitionRef.current.active && cameraRef.current && controlsRef.current) {
        const cam = cameraRef.current;
        const ctr = controlsRef.current;
        const tPos = cameraTransitionRef.current.targetPos;
        const tLook = cameraTransitionRef.current.targetLook;

        cam.position.lerp(tPos, 0.08);
        ctr.target.lerp(tLook, 0.08);

        if (cam.position.distanceTo(tPos) < 0.5) {
          cameraTransitionRef.current.active = false;
        }
      }

      // VIRAL CINEMATIC ORBIT (Trend Sayohati):
      // Smooth dynamic figure-8 camera glide zooming and panning across the 3D relief
      if (isCinematicOrbitRef.current && cameraRef.current && controlsRef.current && !cameraTransitionRef.current.active) {
        const t = now * 0.0006;
        const orbitRadius = 145 + Math.sin(t * 1.5) * 25; // Gentle zoom in and out
        const orbitX = Math.sin(t) * 48; // Smooth side angle to highlight 3D extrusion
        const orbitY = Math.cos(t * 0.8) * 22; // Subtle vertical pitch
        const orbitZ = Math.sqrt(Math.max(10, orbitRadius * orbitRadius - orbitX * orbitX));

        _orbitPos.set(orbitX, orbitY, orbitZ);
        cameraRef.current.position.lerp(_orbitPos, 0.04);
        controlsRef.current.target.set(Math.sin(t * 0.5) * 4, Math.cos(t * 0.4) * 3, 0);
      } else if (curSettings.autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 2.0;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      if (isSoftwareGl) {
        // Pace loop on software WebGL
        const gl = rendererRef.current?.getContext();
        if (gl && gl.fenceSync) {
          const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
          gl.flush();
          const poll = () => {
            const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (state === gl.UNSIGNALED) {
              animationFrameRef.current = window.setTimeout(poll, 5);
            } else {
              gl.deleteSync(sync);
              animationFrameRef.current = window.setTimeout(tick, 75);
            }
          };
          animationFrameRef.current = window.setTimeout(poll, 5);
        } else {
          animationFrameRef.current = window.setTimeout(tick, 75);
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    tick();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || window.innerWidth;
      const h = mountRef.current.clientHeight || window.innerHeight;

      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(w, h);
      if (shaderMaterialRef.current) {
        shaderMaterialRef.current.uniforms.uPixelRatio.value = rendererRef.current.getPixelRatio();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(animationFrameRef.current);
      } else {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
      if (glyphAtlasRef.current) glyphAtlasRef.current.dispose();
      if (pointsRef.current?.geometry) pointsRef.current.geometry.dispose();
      if (shaderMaterialRef.current) shaderMaterialRef.current.dispose();
    };
  }, []); // Run once on mount

  // Watch for resolution / sharpness changes to rebuild geometry
  useEffect(() => {
    if (!imageSource) return;
    const geom = buildGeometryFromImage(
      imageSource,
      imageWidth,
      imageHeight,
      settings.resolution,
      settings.sharpness || 1.0
    );
    if (geom) {
      updateMeshGeometry(geom);
    }
  }, [imageSource, imageWidth, imageHeight, settings.resolution, settings.sharpness, buildGeometryFromImage, updateMeshGeometry]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* 3D Canvas Mounting Target */}
      <div 
        ref={mountRef} 
        className={`w-full h-full transition-all duration-300 ${
          aspectRatioMode === '9:16'
            ? 'max-w-[480px] mx-auto border-x border-white/10 shadow-2xl'
            : aspectRatioMode === '1:1'
            ? 'max-w-[720px] max-h-[720px] my-auto mx-auto border border-white/10 rounded-2xl shadow-2xl'
            : ''
        }`} 
      />

      {/* Frame overlay guideline for Instagram Reels / Stories format */}
      {aspectRatioMode === '9:16' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 px-3 py-1 bg-black/70 border border-emerald-500/40 rounded-full text-[10px] font-mono text-emerald-300 backdrop-blur-md">
          Instagram Stories / Reels (9:16)
        </div>
      )}
      {aspectRatioMode === '1:1' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 px-3 py-1 bg-black/70 border border-emerald-500/40 rounded-full text-[10px] font-mono text-emerald-300 backdrop-blur-md">
          Instagram Post / Kvadrat (1:1)
        </div>
      )}
    </div>
  );
});

MatrixScene.displayName = 'MatrixScene';
