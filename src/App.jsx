import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PRESET_IMAGES } from './utils/presetImages.js';
import { MatrixScene } from './components/MatrixScene.jsx';
import { ControlDock } from './components/ControlDock.jsx';
import { HeaderBar } from './components/HeaderBar.jsx';
import { soundFx } from './utils/audio.js';
import { Upload, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import heic2any from 'heic2any';

export const App = () => {
  const [settings, setSettings] = useState({
    morphProgress: 0.90, // Default 3D binary view
    depthExtrusion: 38,
    pointSize: 22,
    resolution: 96,
    theme: 'matrix-green', // Initial model uses matrix green, but uploaded photos switch to true-rgb
    customColor: '#00ff88',
    mode: 'hologram',
    waveIntensity: 0.8,
    rainSpeed: 0.8,
    autoRotate: false,
    soundEnabled: true,
    brightness: 0.0,
    contrast: 1.15,
    threshold: 0.5,
  });

  const [currentPresetId, setCurrentPresetId] = useState('hacker');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isAutoMorphing, setIsAutoMorphing] = useState(false);
  const [fps, setFps] = useState(60);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadToast, setUploadToast] = useState({ show: false, message: '', loading: false });

  // Active Image Source (Canvas) & dimensions
  const [activeImageSource, setActiveImageSource] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 512, height: 512 });

  const sceneRef = useRef(null);
  const videoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const autoMorphAnimRef = useRef(0);
  const autoMorphDirRef = useRef(1);
  const webcamUpdateIntervalRef = useRef(0);

  // Preset generator (keeps default 3D model on initial boot so user sees it working immediately)
  const renderPresetToCanvas = useCallback((presetId) => {
    const preset = PRESET_IMAGES.find((p) => p.id === presetId) || PRESET_IMAGES[0];
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    preset.draw(ctx, canvas.width, canvas.height);
    setActiveImageSource(canvas);
    setImageDimensions({ width: 512, height: 512 });
  }, []);

  // Initial load: render default 3D model
  useEffect(() => {
    renderPresetToCanvas('hacker');
  }, [renderPresetToCanvas]);

  // Audio ambient hum
  useEffect(() => {
    soundFx.setHum(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Preset selection
  const handleSelectPreset = (id) => {
    stopWebcam();
    setCurrentPresetId(id);
    setUploadedFileName('');
    renderPresetToCanvas(id);
  };

  // Convert loaded image element onto offscreen canvas and pipe to 3D matrix engine
  const applyImageElementToMatrix = useCallback((img, fileName) => {
    const canvas = document.createElement('canvas');
    const maxDim = 800;
    let w = img.naturalWidth || img.width || 512;
    let h = img.naturalHeight || img.height || 512;

    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);
    setActiveImageSource(canvas);
    setImageDimensions({ width: w, height: h });
    setCurrentPresetId('custom');
    setUploadedFileName(fileName || 'Yuklangan rasm');
    soundFx.playMorph(settings.soundEnabled);

    // CRITICAL: Switch to 'true-rgb' so the photo appears in its authentic natural colors
    // with NO strange cyan/blueish tint, and ensure 3D relief is visible!
    setSettings((prev) => ({
      ...prev,
      theme: 'true-rgb',
      morphProgress: Math.max(prev.morphProgress, 0.90),
    }));

    if (sceneRef.current) {
      sceneRef.current.updateImageSource(canvas, w, h);
    }

    // Success toast
    setUploadToast({
      show: true,
      message: `"${fileName || 'Rasm'}" yuklandi — Asl ranglarda 3D 0 va 1 larda koʻrsatilmoqda!`,
      loading: false,
    });
    setTimeout(() => {
      setUploadToast({ show: false, message: '', loading: false });
    }, 4500);
  }, [settings.soundEnabled]);

  // Process any uploaded Image File (JPG, PNG, HEIC, WebP, etc.)
  const processImageFile = useCallback(async (file) => {
    if (!file) return;
    stopWebcam();

    let processedBlob = file;
    const isHeic = file.name?.toLowerCase().endsWith('.heic') || 
                   file.name?.toLowerCase().endsWith('.heif') ||
                   file.type === 'image/heic' || 
                   file.type === 'image/heif';

    if (isHeic) {
      setUploadToast({
        show: true,
        message: 'iPhone HEIC rasm ochilmoqda...',
        loading: true,
      });
      try {
        const conversionResult = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.92,
        });
        processedBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
      } catch (heicErr) {
        console.warn('HEIC conversion fallback:', heicErr);
      }
    }

    try {
      const objectUrl = URL.createObjectURL(processedBlob);
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        applyImageElementToMatrix(img, file.name);
        URL.revokeObjectURL(objectUrl);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        // Fallback to FileReader
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              applyImageElementToMatrix(fallbackImg, file.name);
            };
            fallbackImg.src = e.target.result;
          }
        };
        reader.readAsDataURL(processedBlob);
      };

      img.src = objectUrl;
    } catch {
      // FileReader fallback
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            applyImageElementToMatrix(fallbackImg, file.name);
          };
          fallbackImg.src = e.target.result;
        }
      };
      reader.readAsDataURL(processedBlob);
    }
  }, [applyImageElementToMatrix]);

  // Global Drag and Drop Handlers
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        processImageFile(e.dataTransfer.files[0]);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [processImageFile]);

  // Webcam Controls
  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    if (webcamUpdateIntervalRef.current) {
      clearInterval(webcamUpdateIntervalRef.current);
      webcamUpdateIntervalRef.current = 0;
    }
    setIsWebcamActive(false);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 480 } },
      });
      webcamStreamRef.current = stream;

      if (!videoRef.current) {
        const vid = document.createElement('video');
        vid.autoplay = true;
        vid.playsInline = true;
        vid.muted = true;
        videoRef.current = vid;
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      setIsWebcamActive(true);
      setCurrentPresetId('webcam');
      setUploadedFileName('Jonli Kamera');

      // Sync webcam frame to canvas periodically
      const captureWebcamFrame = () => {
        if (!videoRef.current || !isWebcamActive) return;
        const vid = videoRef.current;
        if (vid.readyState >= 2) {
          const canvas = document.createElement('canvas');
          canvas.width = 384;
          canvas.height = 384;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(vid, 0, 0, 384, 384);
            setActiveImageSource(canvas);
            setImageDimensions({ width: 384, height: 384 });
            if (sceneRef.current) {
              sceneRef.current.updateImageSource(canvas, 384, 384);
            }
          }
        }
      };

      captureWebcamFrame();
      webcamUpdateIntervalRef.current = window.setInterval(captureWebcamFrame, 150);
    } catch (err) {
      console.warn('Webcam permission error:', err);
      setIsWebcamActive(false);
    }
  };

  const handleToggleWebcam = () => {
    if (isWebcamActive) {
      stopWebcam();
      renderPresetToCanvas(currentPresetId === 'webcam' ? 'hacker' : currentPresetId);
    } else {
      startWebcam();
    }
  };

  // Auto 2D <-> 3D Morphing Animation loop
  const toggleAutoMorph = () => {
    setIsAutoMorphing((prev) => !prev);
  };

  useEffect(() => {
    if (!isAutoMorphing) {
      if (autoMorphAnimRef.current) cancelAnimationFrame(autoMorphAnimRef.current);
      return;
    }

    let lastTime = performance.now();
    const morphLoop = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setSettings((prev) => {
        let next = prev.morphProgress + autoMorphDirRef.current * dt * 0.4;
        if (next >= 1.0) {
          next = 1.0;
          autoMorphDirRef.current = -1;
        } else if (next <= 0.0) {
          next = 0.0;
          autoMorphDirRef.current = 1;
        }
        return { ...prev, morphProgress: next };
      });
      autoMorphAnimRef.current = requestAnimationFrame(morphLoop);
    };

    autoMorphAnimRef.current = requestAnimationFrame(morphLoop);
    return () => cancelAnimationFrame(autoMorphAnimRef.current);
  }, [isAutoMorphing]);

  // Snapshot Capture & Download
  const handleCaptureSnapshot = () => {
    if (!sceneRef.current) return;
    const dataUrl = sceneRef.current.captureSnapshot();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `tMatrix-3D-binary-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Camera Presets
  const handleCameraPreset = (preset) => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera(preset);
    }
  };

  const handleResetView = () => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera('front');
    }
  };

  const totalParticles = settings.resolution * Math.round(settings.resolution / (imageDimensions.width / imageDimensions.height));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060709] font-sans select-none">
      {/* 3D WebGL Canvas Layer */}
      <MatrixScene
        ref={sceneRef}
        settings={settings}
        imageSource={activeImageSource}
        imageWidth={imageDimensions.width}
        imageHeight={imageDimensions.height}
        onFpsUpdate={setFps}
      />

      {/* Upload Status Toast */}
      {uploadToast.show && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-gray-950/95 border border-emerald-400 text-emerald-300 rounded-full text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-2">
          {uploadToast.loading ? (
            <Loader2 size={16} className="text-emerald-400 shrink-0 animate-spin" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          )}
          <span>{uploadToast.message}</span>
        </div>
      )}

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/80 backdrop-blur-md border-4 border-dashed border-emerald-400 p-8">
          <div className="bg-gray-950/95 border border-emerald-400 p-8 rounded-2xl flex flex-col items-center gap-3 text-center shadow-2xl">
            <Upload size={48} className="text-emerald-400 animate-bounce" />
            <h2 className="text-xl font-mono font-bold text-emerald-300">Rasmni bu yerga tashlang</h2>
            <p className="text-sm font-mono text-gray-300">Rasm lahzada 3D 0 va 1 piksellarga aylanadi</p>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <HeaderBar
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onUploadImage={processImageFile}
        isWebcamActive={isWebcamActive}
        onToggleWebcam={handleToggleWebcam}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onCaptureSnapshot={handleCaptureSnapshot}
        onResetView={handleResetView}
        fps={fps}
        uploadedFileName={uploadedFileName}
      />

      {/* Unified Bottom Control Dock */}
      <ControlDock
        settings={settings}
        onSettingsChange={(newSet) => setSettings((s) => ({ ...s, ...newSet }))}
        onCameraPreset={handleCameraPreset}
        onUploadImage={processImageFile}
        isAutoMorphing={isAutoMorphing}
        onToggleAutoMorph={toggleAutoMorph}
        totalParticles={totalParticles}
        uploadedFileName={uploadedFileName}
      />
    </div>
  );
};
