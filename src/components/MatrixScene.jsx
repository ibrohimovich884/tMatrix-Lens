import React, { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createBinaryGlyphAtlas } from '../utils/matrixAtlas.js';

// Pre-allocated math objects at module scope (Three.js skill directive: zero GC in render loop)
const _cameraTarget = new THREE.Vector3(0, 0, 0);
const _targetPos = new THREE.Vector3(0, 0, 160);
const _tempColor = new THREE.Color();

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

        // True original RGB colors
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
          cameraTransitionRef.current.targetPos.set(85, 65, 110);
          cameraTransitionRef.current.targetLook.set(0, 0, 0);
          break;
        case 'top':
          cameraTransitionRef.current.targetPos.set(0, 160, 40);
          cameraTransitionRef.current.targetLook.set(0, 0, 0);
          break;
        case 'closeup':
          cameraTransitionRef.current.targetPos.set(0, 0, 75);
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

    // Clean neutral dark scene (pure black / deep charcoal)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060709);
    // Subtle neutral fog - zero tint!
    scene.fog = new THREE.FogExp2(0x060709, 0.0025);
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
    renderer.toneMappingExposure = 1.15;

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
      uniform int uMode; // 0: Hologram Relief, 1: Matrix Rain, 2: Waves
      uniform float uWaveIntensity;
      uniform float uRainSpeed;
      uniform float uPixelRatio;
      uniform float uBrightness;
      uniform float uContrast;

      attribute vec3 aPosExtruded;
      attribute vec3 aPosRain;
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

      void main() {
        vColor = aColor;
        vLuminance = aLuminance;
        vAlpha = aAlpha;
        vBinary = aBinary;
        vRandom = aRandom;

        // Adjust luminance with brightness and contrast
        float adjLum = (aLuminance + uBrightness) * uContrast;
        adjLum = clamp(adjLum, 0.0, 1.0);

        // Target position based on active 3D mode
        vec3 targetPos = position;

        if (uMode == 0) {
          // 3D Holographic Relief / Terrain
          targetPos = vec3(position.xy, adjLum * uDepthExtrusion);
        } else if (uMode == 1) {
          // Matrix Rain: streaming down vertically
          vec3 rPos = aPosRain;
          float cycle = mod(rPos.y - uTime * (25.0 + uRainSpeed * 40.0) * (0.8 + aRandom * 0.4), 140.0) - 70.0;
          rPos.y = cycle;
          targetPos = rPos;
        } else if (uMode == 2) {
          // Mathematical Sine Wave Ripples
          float distFromCenter = length(position.xy);
          float waveZ = sin(distFromCenter * 0.12 - uTime * 4.0) * (uWaveIntensity * 16.0);
          targetPos = vec3(position.xy, (adjLum * uDepthExtrusion) + waveZ);
        }

        // Morph between 2D flat image and target 3D configuration
        vec3 finalPos = mix(position, targetPos, uMorphProgress);

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Perspective size attenuation
        float pointAtten = 320.0 / -mvPosition.z;
        float lumScale = 0.85 + adjLum * 0.45;
        gl_PointSize = uPointSize * uPixelRatio * pointAtten * lumScale;
        gl_PointSize = clamp(gl_PointSize, 5.0, 90.0);

        vDist = -mvPosition.z;
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform sampler2D uAtlas;
      uniform float uTime;
      uniform float uMorphProgress;
      uniform int uTheme; 
      // 0: True RGB (Asl tabiiy rasm ranglari)
      // 1: Pure White (Tiniq oppoq monoxrom - no blue!)
      // 2: Matrix Green (Klassik matrix yashil)
      // 3: Amber Gold (Oltin qahrabo)
      // 4: Cyber Cyan (Moviy neon)
      // 5: Cyber Red (Qizil)
      // 6: Custom Color (Foydalanuvchi tanlagan maxsus rang)

      uniform vec3 uCustomColor;
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uThreshold;

      varying vec3 vColor;
      varying float vLuminance;
      varying float vAlpha;
      varying float vBinary;
      varying float vRandom;
      varying float vDist;

      void main() {
        if (vAlpha < 0.05) discard;

        // Apply real-time brightness & contrast
        float adjLum = (vLuminance + uBrightness) * uContrast;
        adjLum = clamp(adjLum, 0.0, 1.0);

        // Binary glyph decision: based on user threshold setting
        float activeGlyph = adjLum >= uThreshold ? 1.0 : 0.0;

        // Sample '0' or '1' from atlas
        // Left half (0..0.5) is '0', Right half (0.5..1.0) is '1'
        float uOffset = activeGlyph > 0.5 ? 0.5 : 0.0;
        vec2 atlasCoord = vec2(uOffset + gl_PointCoord.x * 0.5, gl_PointCoord.y);
        vec4 glyphTex = texture2D(uAtlas, atlasCoord);

        // When morph progress is low, blend towards solid pixel square
        float shapeAlpha = mix(1.0, glyphTex.a, smoothstep(0.04, 0.35, uMorphProgress));
        if (shapeAlpha < 0.06) discard;

        // Clean color shading
        vec3 baseColor;

        if (uTheme == 0) {
          // 0: TRUE RGB - 100% authentic unadulterated photo colors (NO cyan/blue tint)
          vec3 adjRGB = (vColor + vec3(uBrightness)) * uContrast;
          baseColor = clamp(adjRGB, 0.0, 1.0);
        } else if (uTheme == 1) {
          // 1: PURE WHITE - Crisp pristine white 0 and 1s, completely neutral
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
          // 4: CYBER CYAN / BLUE (Faqat foydalanuvchi ataylab ko'k xohlasagina)
          vec3 cyanDark = vec3(0.0, 0.25, 0.45);
          vec3 cyanBright = vec3(0.0, 0.85, 1.0);
          baseColor = mix(cyanDark, cyanBright, adjLum);
        } else if (uTheme == 5) {
          // 5: CYBER RED
          vec3 redDark = vec3(0.35, 0.02, 0.06);
          vec3 redBright = vec3(1.0, 0.15, 0.25);
          baseColor = mix(redDark, redBright, adjLum);
        } else {
          // 6: CUSTOM COLOR PICKER
          baseColor = uCustomColor * (0.28 + adjLum * 0.72);
        }

        // Subtly emphasize glyph edges without tinting
        gl_FragColor = vec4(baseColor, shapeAlpha * vAlpha * (0.7 + adjLum * 0.3));
      }
    `;

    // Parse custom color from settings
    _tempColor.set(settings.customColor || '#00ff88');

    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMorphProgress: { value: settings.morphProgress },
        uDepthExtrusion: { value: settings.depthExtrusion },
        uPointSize: { value: settings.pointSize },
        uMode: { value: 0 },
        uWaveIntensity: { value: settings.waveIntensity || 0.8 },
        uRainSpeed: { value: settings.rainSpeed || 0.8 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uAtlas: { value: glyphAtlas },
        uTheme: { value: 0 },
        uCustomColor: { value: new THREE.Vector3(_tempColor.r, _tempColor.g, _tempColor.b) },
        uBrightness: { value: settings.brightness ?? 0.0 },
        uContrast: { value: settings.contrast ?? 1.15 },
        uThreshold: { value: settings.threshold ?? 0.5 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    shaderMaterialRef.current = shaderMaterial;

    // Ambient & Directional Lights - PURE NEUTRAL WHITE (Zero blue/cyan casting!)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirKeyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirKeyLight.position.set(50, 70, 80);
    scene.add(dirKeyLight);

    const dirFillLight = new THREE.DirectionalLight(0xffffff, 0.4);
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
        uniforms.uWaveIntensity.value = settingsRef.current.waveIntensity || 0.8;
        uniforms.uRainSpeed.value = settingsRef.current.rainSpeed || 0.8;
        uniforms.uBrightness.value = settingsRef.current.brightness ?? 0.0;
        uniforms.uContrast.value = settingsRef.current.contrast ?? 1.15;
        uniforms.uThreshold.value = settingsRef.current.threshold ?? 0.5;

        // Map mode string to integer
        const modeMap = {
          'hologram': 0,
          'matrix-rain': 1,
          'waves': 2,
        };
        uniforms.uMode.value = modeMap[settingsRef.current.mode] ?? 0;

        // Map theme string to integer
        const themeMap = {
          'true-rgb': 0,
          'pure-white': 1,
          'matrix-green': 2,
          'amber-gold': 3,
          'cyber-cyan': 4,
          'red-alert': 5,
          'custom': 6,
        };
        uniforms.uTheme.value = themeMap[settingsRef.current.theme] ?? 0;

        // Update custom color uniform if user picked a custom color
        if (settingsRef.current.customColor) {
          _tempColor.set(settingsRef.current.customColor);
          uniforms.uCustomColor.value.set(_tempColor.r, _tempColor.g, _tempColor.b);
        }
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
      if (pointsRef.current && pointsRef.current.geometry) {
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
