import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createBinaryGlyphAtlas } from '../utils/matrixAtlas.js';

// Pre-allocated math objects at module scope (Three.js skill directive: zero GC in render loop)
const _cameraTarget = new THREE.Vector3(0, 0, 0);
const _targetPos = new THREE.Vector3(0, 0, 160);

export const MatrixScene = forwardRef(({
  settings,
  imageSource,
  imageWidth,
  imageHeight,
  onFpsUpdate,
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

  // Sampling canvas for pixel processing
  const sampleCanvasRef = useRef(null);

  // Settings ref to access inside loop without recreating listeners
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Camera transition state
  const cameraTransitionRef = useRef({
    active: false,
    targetPos: new THREE.Vector3(0, 0, 160),
    targetLook: new THREE.Vector3(0, 0, 0),
  });

  // Re-build geometry whenever an image (preset or uploaded) or resolution changes
  const buildGeometryFromImage = useCallback((source, srcW, srcH, res) => {
    if (!source) return null;

    if (!sampleCanvasRef.current) {
      sampleCanvasRef.current = document.createElement('canvas');
    }
    const canvas = sampleCanvasRef.current;

    // Calculate aspect ratio preserving grid
    const aspect = (srcW && srcH) ? (srcW / srcH) : 1;
    let gridCols = res;
    let gridRows = Math.round(res / aspect);
    if (gridRows > res * 1.6) gridRows = Math.round(res * 1.6);
    if (gridRows < res * 0.4) gridRows = Math.round(res * 0.4);

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
    const posSphere = new Float32Array(totalParticles * 3);
    const colors = new Float32Array(totalParticles * 3);
    const luminances = new Float32Array(totalParticles);
    const binaries = new Float32Array(totalParticles);
    const randoms = new Float32Array(totalParticles);
    const alphas = new Float32Array(totalParticles);

    const worldWidth = 120;
    const worldHeight = worldWidth / aspect;

    const data = imgData.data;
    let pIdx = 0;

    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        const dIdx = (y * gridCols + x) * 4;
        const r = data[dIdx] / 255;
        const g = data[dIdx + 1] / 255;
        const b = data[dIdx + 2] / 255;
        const a = data[dIdx + 3] / 255;

        // Luminance calculation
        const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) * a;

        // Flat 2D position (centered)
        const nx = (x / (gridCols - 1) - 0.5) * worldWidth;
        const ny = (0.5 - y / (gridRows - 1)) * worldHeight;

        posFlat[pIdx * 3] = nx;
        posFlat[pIdx * 3 + 1] = ny;
        posFlat[pIdx * 3 + 2] = 0;

        // 3D Extruded position: Z depends on luminance
        posExtruded[pIdx * 3] = nx;
        posExtruded[pIdx * 3 + 1] = ny;
        posExtruded[pIdx * 3 + 2] = lum; // modulated by uDepthExtrusion in shader

        // Matrix Rain position
        const colSeed = Math.sin(x * 12.9898) * 43758.5453;
        posRain[pIdx * 3] = nx + (Math.sin(x * 4.0) * 1.5);
        posRain[pIdx * 3 + 1] = ny;
        posRain[pIdx * 3 + 2] = (Math.sin(x * 0.8 + y * 0.2) * 20.0) + ((colSeed % 1) - 0.5) * 35.0;

        // 3D Holographic Cylinder / Sphere position
        const u = (x / gridCols) * Math.PI * 1.5 - Math.PI * 0.75;
        const v = (y / gridRows - 0.5) * Math.PI * 0.85;
        const radius = worldWidth * 0.55 + lum * 12.0;
        posSphere[pIdx * 3] = Math.sin(u) * Math.cos(v) * radius;
        posSphere[pIdx * 3 + 1] = Math.sin(v) * radius;
        posSphere[pIdx * 3 + 2] = (Math.cos(u) * Math.cos(v) - 0.5) * radius;

        // Colors
        colors[pIdx * 3] = r;
        colors[pIdx * 3 + 1] = g;
        colors[pIdx * 3 + 2] = b;

        luminances[pIdx] = lum;
        alphas[pIdx] = a;
        // Alternating binary assignment (0 vs 1)
        binaries[pIdx] = ((x ^ y) & 1) === 0 ? 0.0 : 1.0;
        randoms[pIdx] = Math.abs(Math.sin(x * 78.233 + y * 37.719));

        pIdx++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(posFlat, 3));
    geometry.setAttribute('aPosExtruded', new THREE.BufferAttribute(posExtruded, 3));
    geometry.setAttribute('aPosRain', new THREE.BufferAttribute(posRain, 3));
    geometry.setAttribute('aPosSphere', new THREE.BufferAttribute(posSphere, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aLuminance', new THREE.BufferAttribute(luminances, 1));
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
    captureSnapshot: () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      return rendererRef.current.domElement.toDataURL('image/png');
    },
    resetCamera: (preset) => {
      if (!cameraRef.current || !controlsRef.current) return;
      cameraTransitionRef.current.active = true;

      switch (preset) {
        case 'front':
          cameraTransitionRef.current.targetPos.set(0, 0, 160);
          cameraTransitionRef.current.targetLook.set(0, 0, 0);
          break;
        case 'isometric':
          cameraTransitionRef.current.targetPos.set(95, 75, 115);
          cameraTransitionRef.current.targetLook.set(0, 0, 0);
          break;
        case 'top':
          cameraTransitionRef.current.targetPos.set(0, 160, 40);
          cameraTransitionRef.current.targetLook.set(0, 0, 0);
          break;
        case 'dramatic':
          cameraTransitionRef.current.targetPos.set(0, -65, 80);
          cameraTransitionRef.current.targetLook.set(0, 10, 0);
          break;
        case 'closeup':
          cameraTransitionRef.current.targetPos.set(0, 0, 65);
          cameraTransitionRef.current.targetLook.set(0, 0, 0);
          break;
        default:
          cameraTransitionRef.current.targetPos.set(0, 0, 160);
          cameraTransitionRef.current.targetLook.set(0, 0, 0);
          break;
      }
    },
    updateImageSource: (source, width, height) => {
      const geom = buildGeometryFromImage(source, width, height, settingsRef.current.resolution);
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

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020508);
    scene.fog = new THREE.FogExp2(0x020508, 0.0035);
    sceneRef.current = scene;

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 160);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 20;
    controls.maxDistance = 350;
    controls.maxPolarAngle = Math.PI * 0.95;
    controlsRef.current = controls;

    // Binary Glyph Atlas (Canvas 0 & 1)
    const glyphAtlas = createBinaryGlyphAtlas();
    glyphAtlasRef.current = glyphAtlas;

    // Custom GLSL Shaders for 3D Binary Particles
    const vertexShader = `
      uniform float uTime;
      uniform float uMorphProgress;
      uniform float uDepthExtrusion;
      uniform float uPointSize;
      uniform int uMode; // 0: Hologram, 1: Rain, 2: Dispersion, 3: Waves, 4: Sphere
      uniform float uWaveIntensity;
      uniform float uRainSpeed;
      uniform float uPixelRatio;
      uniform float uInvertLuminance;
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uGammaCurve;
      uniform float uThreshold;
      uniform float uFilterDarkBg;

      attribute vec3 aPosExtruded;
      attribute vec3 aPosRain;
      attribute vec3 aPosSphere;
      attribute vec3 aColor;
      attribute float aLuminance;
      attribute float aAlpha;
      attribute float aBinary;
      attribute float aRandom;

      varying vec3 vColor;
      varying float vLuminance;
      varying float vAlpha;
      varying float vBinary;
      varying float vRandom;
      varying float vDist;
      varying vec3 vWorldPos;

      void main() {
        vColor = aColor;
        vLuminance = aLuminance;
        vAlpha = aAlpha;
        vBinary = aBinary;
        vRandom = aRandom;

        // Adjust luminance with brightness, contrast and gamma
        float adjLum = (aLuminance + uBrightness - 0.5) * uContrast + 0.5;
        adjLum = clamp(adjLum, 0.0, 1.0);
        adjLum = pow(adjLum, max(0.2, uGammaCurve));

        // Invert luminance if requested
        float effLum = uInvertLuminance > 0.5 ? (1.0 - adjLum) : adjLum;

        // Target position based on active 3D mode
        vec3 targetPos = position;

        if (uMode == 0) {
          // 3D Holographic Relief / Terrain
          targetPos = vec3(position.xy, effLum * uDepthExtrusion);
        } else if (uMode == 1) {
          // Matrix Rain: streaming down vertically
          vec3 rPos = aPosRain;
          float cycle = mod(rPos.y - uTime * (25.0 + uRainSpeed * 40.0) * (0.8 + aRandom * 0.4), 140.0) - 70.0;
          rPos.y = cycle;
          targetPos = rPos;
        } else if (uMode == 2) {
          // Quantum Dispersion / Disintegration
          vec3 dispOffset = vec3(
            sin(position.x * 0.05 + uTime * 1.5 + aRandom * 12.0) * 25.0,
            cos(position.y * 0.05 + uTime * 1.2 + aRandom * 8.0) * 25.0,
            (effLum * uDepthExtrusion) + sin(uTime * 2.0 + aRandom * 20.0) * 35.0
          );
          targetPos = position + dispOffset;
        } else if (uMode == 3) {
          // Mathematical Sine Wave Ripples
          float distFromCenter = length(position.xy);
          float waveZ = sin(distFromCenter * 0.12 - uTime * 4.0) * (uWaveIntensity * 15.0);
          targetPos = vec3(position.xy, (effLum * uDepthExtrusion) + waveZ);
        } else if (uMode == 4) {
          // Cylindrical / Spherical Holographic Wrap
          targetPos = aPosSphere;
        }

        // Morph between 2D flat image and target 3D configuration
        vec3 finalPos = mix(position, targetPos, uMorphProgress);
        vWorldPos = finalPos;

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Perspective size attenuation
        float pointAtten = 320.0 / -mvPosition.z;
        float lumScale = 0.8 + effLum * 0.5;
        gl_PointSize = uPointSize * uPixelRatio * pointAtten * lumScale;
        gl_PointSize = clamp(gl_PointSize, 4.0, 95.0);

        vDist = -mvPosition.z;
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform sampler2D uAtlas;
      uniform float uTime;
      uniform float uMorphProgress;
      uniform int uTheme; // 0: Matrix Green, 1: Cyber Cyan, 2: Amber CRT, 3: True RGB, 4: Red Alert, 5: Ghost White
      uniform float uBinaryFlipSpeed;
      uniform float uBloomGlow;
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uGammaCurve;
      uniform float uThreshold;
      uniform float uFilterDarkBg;

      varying vec3 vColor;
      varying float vLuminance;
      varying float vAlpha;
      varying float vBinary;
      varying float vRandom;
      varying float vDist;
      varying vec3 vWorldPos;

      void main() {
        if (vAlpha < 0.05) discard;

        // Apply real-time brightness & contrast to luminance
        float adjLum = (vLuminance + uBrightness - 0.5) * uContrast + 0.5;
        adjLum = clamp(adjLum, 0.0, 1.0);
        adjLum = pow(adjLum, max(0.2, uGammaCurve));

        // If background filter is active, discard dark background pixels
        if (uFilterDarkBg > 0.5 && adjLum < 0.09) discard;

        // Binary glyph decision: based on user threshold setting!
        float thresholdBinary = adjLum >= uThreshold ? 1.0 : 0.0;
        float flickerTrigger = sin(uTime * (uBinaryFlipSpeed * 3.5) + vRandom * 6.28);
        float activeGlyph = thresholdBinary;
        if (uBinaryFlipSpeed > 0.05 && flickerTrigger > 0.42) {
          activeGlyph = 1.0 - activeGlyph;
        }

        // Sample '0' or '1' from atlas
        // Left half (0..0.5) is '0', Right half (0.5..1.0) is '1'
        float uOffset = activeGlyph > 0.5 ? 0.5 : 0.0;
        vec2 atlasCoord = vec2(uOffset + gl_PointCoord.x * 0.5, gl_PointCoord.y);
        vec4 glyphTex = texture2D(uAtlas, atlasCoord);

        // When morph progress is low, blend towards solid pixel square
        float shapeAlpha = mix(1.0, glyphTex.a, smoothstep(0.05, 0.4, uMorphProgress));
        if (shapeAlpha < 0.08) discard;

        // Color Themes
        vec3 baseColor;
        if (uTheme == 0) {
          // Classic Matrix Green
          vec3 greenDark = vec3(0.02, 0.45, 0.15);
          vec3 greenNeon = vec3(0.0, 1.0, 0.42);
          vec3 greenHighlight = vec3(0.85, 1.0, 0.9);
          baseColor = mix(greenDark, greenNeon, adjLum);
          if (adjLum > 0.75) {
            baseColor = mix(baseColor, greenHighlight, (adjLum - 0.75) * 3.0);
          }
        } else if (uTheme == 1) {
          // Cyberpunk Cyan / Neon Violet
          vec3 cyan = vec3(0.0, 0.95, 1.0);
          vec3 violet = vec3(0.55, 0.0, 1.0);
          baseColor = mix(violet, cyan, adjLum * 1.2);
        } else if (uTheme == 2) {
          // Amber CRT Terminal
          vec3 amberDeep = vec3(0.5, 0.15, 0.0);
          vec3 amberGlow = vec3(1.0, 0.72, 0.08);
          vec3 amberWhite = vec3(1.0, 0.95, 0.7);
          baseColor = mix(amberDeep, amberGlow, adjLum);
          if (adjLum > 0.8) baseColor = mix(baseColor, amberWhite, (adjLum - 0.8) * 4.0);
        } else if (uTheme == 3) {
          // True RGB from original uploaded image with contrast boost
          vec3 adjRGB = (vColor + vec3(uBrightness) - vec3(0.5)) * uContrast + vec3(0.5);
          baseColor = clamp(adjRGB, 0.0, 1.0) * 1.35;
        } else if (uTheme == 4) {
          // Red Alert / Cyber Neon Crimson
          vec3 redDeep = vec3(0.4, 0.0, 0.08);
          vec3 redNeon = vec3(1.0, 0.15, 0.28);
          vec3 redSpark = vec3(1.0, 0.85, 0.9);
          baseColor = mix(redDeep, redNeon, adjLum);
          if (adjLum > 0.8) baseColor = mix(baseColor, redSpark, (adjLum - 0.8) * 4.0);
        } else {
          // Ghost White / Holographic Cyan-Ice
          vec3 iceDark = vec3(0.1, 0.25, 0.4);
          vec3 iceBright = vec3(0.75, 0.92, 1.0);
          baseColor = mix(iceDark, iceBright, adjLum);
        }

        // In 2D mode, smoothly show natural colors if transforming from flat
        if (uMorphProgress < 0.5 && uTheme != 3) {
          baseColor = mix(vColor, baseColor, uMorphProgress * 2.0);
        }

        // Digital scanline effect
        float scanline = sin(gl_PointCoord.y * 12.56) * 0.15;
        baseColor += scanline;

        // Depth fog / glow intensity
        float depthGlow = clamp((vDist - 40.0) / 250.0, 0.0, 0.6);
        baseColor = mix(baseColor, vec3(0.01, 0.05, 0.03), depthGlow);

        // Boost core brightness
        baseColor *= (1.0 + uBloomGlow * 0.7);

        gl_FragColor = vec4(baseColor, shapeAlpha * vAlpha * (0.6 + adjLum * 0.4));
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: settings.morphProgress },
        uDepthExtrusion: { value: settings.depthExtrusion },
        uPointSize: { value: settings.pointSize },
        uMode: { value: 0 },
        uWaveIntensity: { value: settings.waveIntensity },
        uRainSpeed: { value: settings.rainSpeed },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uInvertLuminance: { value: settings.invertLuminance ? 1.0 : 0.0 },
        uAtlas: { value: glyphAtlas },
        uTheme: { value: 0 },
        uBinaryFlipSpeed: { value: settings.binaryFlipSpeed },
        uBloomGlow: { value: settings.bloomGlow },
        uBrightness: { value: settings.brightness ?? 0.0 },
        uContrast: { value: settings.contrast ?? 1.15 },
        uThreshold: { value: settings.threshold ?? 0.5 },
        uGammaCurve: { value: settings.gammaCurve ?? 1.0 },
        uFilterDarkBg: { value: settings.filterDarkBg ? 1.0 : 0.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    shaderMaterialRef.current = shaderMaterial;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x0a1f14, 0.6);
    scene.add(ambientLight);

    const dirKeyLight = new THREE.DirectionalLight(0x00ff88, 1.2);
    dirKeyLight.position.set(50, 70, 80);
    scene.add(dirKeyLight);

    const dirFillLight = new THREE.DirectionalLight(0x00e5ff, 0.8);
    dirFillLight.position.set(-60, -40, 50);
    scene.add(dirFillLight);

    // Initial Mesh Creation
    if (imageSource) {
      const geom = buildGeometryFromImage(imageSource, imageWidth, imageHeight, settings.resolution);
      if (geom) {
        const points = new THREE.Points(geom, shaderMaterial);
        points.frustumCulled = false;
        scene.add(points);
        pointsRef.current = points;
      }
    }

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      if (shaderMaterialRef.current) {
        shaderMaterialRef.current.uniforms.uPixelRatio.value = rendererRef.current.getPixelRatio();
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsUpdate = 0;

    const renderLoop = () => {
      animationFrameRef.current = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // FPS calculation
      frameCount++;
      if (elapsedTime - lastFpsUpdate >= 0.5) {
        const fps = Math.round(frameCount / (elapsedTime - lastFpsUpdate));
        if (onFpsUpdate) onFpsUpdate(fps);
        frameCount = 0;
        lastFpsUpdate = elapsedTime;
      }

      // Smooth camera transition if active
      if (cameraTransitionRef.current.active && cameraRef.current && controlsRef.current) {
        const trans = cameraTransitionRef.current;
        cameraRef.current.position.lerp(trans.targetPos, 0.08);
        controlsRef.current.target.lerp(trans.targetLook, 0.08);

        if (cameraRef.current.position.distanceTo(trans.targetPos) < 0.5) {
          trans.active = false;
        }
      }

      // Auto-rotation when enabled
      if (settingsRef.current.autoRotate && !cameraTransitionRef.current.active && pointsRef.current) {
        pointsRef.current.rotation.y += delta * 0.35;
      } else if (pointsRef.current && !settingsRef.current.autoRotate) {
        pointsRef.current.rotation.y = THREE.MathUtils.damp(pointsRef.current.rotation.y, 0, 4.0, delta);
      }

      // Update shader uniforms
      if (shaderMaterialRef.current) {
        const uniforms = shaderMaterialRef.current.uniforms;
        uniforms.uTime.value = elapsedTime;
        uniforms.uMorphProgress.value = settingsRef.current.morphProgress;
        uniforms.uDepthExtrusion.value = settingsRef.current.depthExtrusion;
        uniforms.uPointSize.value = settingsRef.current.pointSize;
        uniforms.uWaveIntensity.value = settingsRef.current.waveIntensity;
        uniforms.uRainSpeed.value = settingsRef.current.rainSpeed;
        uniforms.uInvertLuminance.value = settingsRef.current.invertLuminance ? 1.0 : 0.0;
        uniforms.uBinaryFlipSpeed.value = settingsRef.current.binaryFlipSpeed;
        uniforms.uBloomGlow.value = settingsRef.current.bloomGlow;
        uniforms.uBrightness.value = settingsRef.current.brightness ?? 0.0;
        uniforms.uContrast.value = settingsRef.current.contrast ?? 1.15;
        uniforms.uThreshold.value = settingsRef.current.threshold ?? 0.5;
        uniforms.uGammaCurve.value = settingsRef.current.gammaCurve ?? 1.0;
        uniforms.uFilterDarkBg.value = settingsRef.current.filterDarkBg ? 1.0 : 0.0;

        // Map mode string to integer
        const modeMap = {
          'hologram': 0,
          'matrix-rain': 1,
          'dispersion': 2,
          'waves': 3,
          'sphere': 4,
        };
        uniforms.uMode.value = modeMap[settingsRef.current.mode] ?? 0;

        // Map theme string to integer
        const themeMap = {
          'matrix-green': 0,
          'cyber-cyan': 1,
          'amber-crt': 2,
          'true-rgb': 3,
          'red-alert': 4,
          'ghost-white': 5,
        };
        uniforms.uTheme.value = themeMap[settingsRef.current.theme] ?? 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    renderLoop();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      controls.dispose();
      renderer.dispose();
      if (glyphAtlasRef.current) glyphAtlasRef.current.dispose();
      if (shaderMaterialRef.current) shaderMaterialRef.current.dispose();
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
      }
    };
  }, []); // Run once on mount

  // Handle resolution change or image update
  useEffect(() => {
    if (!imageSource) return;
    const geom = buildGeometryFromImage(imageSource, imageWidth, imageHeight, settings.resolution);
    updateMeshGeometry(geom);
  }, [imageSource, imageWidth, imageHeight, settings.resolution, buildGeometryFromImage, updateMeshGeometry]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
});

MatrixScene.displayName = 'MatrixScene';
