import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PRESET_IMAGES } from './utils/presetImages.js';
import { MatrixScene } from './components/MatrixScene.jsx';
import { ControlDock } from './components/ControlDock.jsx';
import { HeaderBar } from './components/HeaderBar.jsx';
import { soundFx } from './utils/audio.js';
import { Upload, Sparkles, CheckCircle2, Loader2, Heart } from 'lucide-react';

export const App = () => {
  const [settings, setSettings] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return {
      morphProgress: 0.95, // Default 3D photorelief
      depthExtrusion: 38,
      pointSize: isMobile ? 22 : 19,
      resolution: isMobile ? 65 : 95, // 95x95 = 9,025 points on desktop, 65x65 on mobile for 60fps
      sharpness: 1.25, // Sharp contours and edges
      particleStyle: 'prism', // 'prism' | 'spheres' | 'glyphs' | 'diamonds'
      theme: 'true-rgb', // Authentic photo colors without any distorting tint
      customColor: '#ff4d88',
      mode: 'hologram',
      waveIntensity: 0.8,
      rainSpeed: 0.8,
      autoRotate: false,
      soundEnabled: true,
      brightness: 0.0,
      contrast: 1.15,
      threshold: 0.5,
      alivePulse: 0.6, // Subtle organic breathing
      laserActive: false, // Laser scan sweep
    };
  });

  const [currentPresetId, setCurrentPresetId] = useState('romantic-lovers');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isAutoMorphing, setIsAutoMorphing] = useState(false);
  const [isCinematicOrbit, setIsCinematicOrbit] = useState(false);
  const [fps, setFps] = useState(60);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadToast, setUploadToast] = useState({ show: false, message: '', loading: false });

  // Video recording state
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);

  // Social media framing (Free / 9:16 Reels / 1:1 Post)
  const [aspectRatioMode, setAspectRatioMode] = useState('free');

  // Active Image Source (Canvas) & dimensions
  const [activeImageSource, setActiveImageSource] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 512, height: 512 });

  const sceneRef = useRef(null);
  const videoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const autoMorphAnimRef = useRef(0);
  const autoMorphDirRef = useRef(1);
  const webcamUpdateIntervalRef = useRef(0);

  // Preset generator
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

  // Initial load: render default romantic model
  useEffect(() => {
    renderPresetToCanvas('romantic-lovers');
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
    setUploadedFileName(fileName || 'Yuklangan surat');
    soundFx.playMorph(settings.soundEnabled);

    // Switch to 'true-rgb' so photo appears in its natural colors and ensure 3D depth is active!
    setSettings((prev) => ({
      ...prev,
      theme: 'true-rgb',
      morphProgress: Math.max(prev.morphProgress, 0.92),
    }));

    if (sceneRef.current) {
      sceneRef.current.updateImageSource(canvas, w, h);
    }

    // Success toast
    setUploadToast({
      show: true,
      message: `"${fileName || 'Surat'}" yuklandi — 3D fotorelyef yaratildi!`,
      loading: false,
    });
    setTimeout(() => {
      setUploadToast({ show: false, message: '', loading: false });
    }, 4500);
  }, [settings.soundEnabled]);

  // Process raw Image File (JPG, PNG, HEIC, WebP, etc.)
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
        message: 'iPhone HEIC format ochilmoqda...',
        loading: true,
      });
      try {
        const { default: heic2any } = await import('heic2any');
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
      renderPresetToCanvas(currentPresetId === 'webcam' ? 'romantic-lovers' : currentPresetId);
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

  // Snapshot Capture & Download (Supports HD multiplier)
  const handleCaptureSnapshot = (highRes = false) => {
    if (!sceneRef.current) return;
    const dataUrl = sceneRef.current.captureSnapshot(highRes);
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `trend-3D-romantic-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setUploadToast({
      show: true,
      message: 'Surat saqlandi! (PNG)',
      loading: false,
    });
    setTimeout(() => {
      setUploadToast({ show: false, message: '', loading: false });
    }, 3000);
  };

  // Instagram Reels Video Recording
  const handleRecordVideo = (durationMs = 6000) => {
    if (!sceneRef.current || isRecordingVideo) return;
    setIsRecordingVideo(true);
    setRecordProgress(0);

    // If cinematic orbit is not active, turn it on for the video recording!
    if (!isCinematicOrbit) {
      setIsCinematicOrbit(true);
    }

    sceneRef.current.startRecordingVideo(
      durationMs,
      (pct) => setRecordProgress(pct),
      (blob) => {
        setIsRecordingVideo(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `trend-3D-reels-${Date.now()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        setUploadToast({
          show: true,
          message: 'Instagram Reels video yuklab olindi! (WebM)',
          loading: false,
        });
        setTimeout(() => {
          setUploadToast({ show: false, message: '', loading: false });
        }, 4000);
      }
    );
  };

  // Camera Presets
  const handleCameraPreset = (preset) => {
    if (sceneRef.current) {
      sceneRef.current.resetCamera(preset);
    }
  };

  const handleResetView = () => {
    setIsCinematicOrbit(false);
    if (sceneRef.current) {
      sceneRef.current.resetCamera('front');
    }
  };

  const totalParticles = settings.resolution * Math.round(settings.resolution / (imageDimensions.width / imageDimensions.height));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#06070a] font-sans select-none">
      {/* 3D WebGL Canvas Layer */}
      <MatrixScene
        ref={sceneRef}
        settings={settings}
        imageSource={activeImageSource}
        imageWidth={imageDimensions.width}
        imageHeight={imageDimensions.height}
        onFpsUpdate={setFps}
        isCinematicOrbit={isCinematicOrbit}
        aspectRatioMode={aspectRatioMode}
      />

      {/* Upload & Action Toast Notification */}
      {uploadToast.show && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-gray-950/95 border border-rose-400 text-rose-300 rounded-full text-xs font-mono shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {uploadToast.loading ? (
            <Loader2 size={16} className="text-rose-400 shrink-0 animate-spin" />
          ) : (
            <CheckCircle2 size={16} className="text-rose-400 shrink-0" />
          )}
          <span>{uploadToast.message}</span>
        </div>
      )}

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/80 backdrop-blur-md border-4 border-dashed border-rose-400 p-8">
          <div className="bg-gray-950/95 border border-rose-400 p-8 rounded-2xl flex flex-col items-center gap-3 text-center shadow-2xl">
            <Upload size={48} className="text-rose-400 animate-bounce" />
            <h2 className="text-xl font-mono font-bold text-rose-300">Suratni bu yerga tashlang</h2>
            <p className="text-sm font-mono text-gray-300">Rasm bir zumda 3D relyinga aylanadi</p>
          </div>
        </div>
      )}

      {/* Top Header Bar with 1 Single Effect Upload Button */}
      <HeaderBar
        currentPresetId={currentPresetId}
        onSelectPreset={handleSelectPreset}
        onUploadImage={processImageFile}
        isWebcamActive={isWebcamActive}
        onToggleWebcam={handleToggleWebcam}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onCaptureSnapshot={() => handleCaptureSnapshot(false)}
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
        uploadedFileName={uploadedFileName}
        isAutoMorphing={isAutoMorphing}
        onToggleAutoMorph={toggleAutoMorph}
        totalParticles={totalParticles}
        isCinematicOrbit={isCinematicOrbit}
        onToggleCinematicOrbit={() => setIsCinematicOrbit((prev) => !prev)}
        onCaptureSnapshot={handleCaptureSnapshot}
        onRecordVideo={handleRecordVideo}
        isRecordingVideo={isRecordingVideo}
        recordProgress={recordProgress}
        aspectRatioMode={aspectRatioMode}
        onChangeAspectRatio={setAspectRatioMode}
      />
    </div>
  );
};
