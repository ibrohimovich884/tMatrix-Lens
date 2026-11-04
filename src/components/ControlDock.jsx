import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layers, 
  RotateCw,
  Sparkles,
  Sliders,
  Sun,
  Minimize2,
  Upload,
  Pipette,
  Check,
  Eye,
  EyeOff,
  Maximize2,
  Box,
  SlidersHorizontal,
  Flame,
  Video,
  Download,
  Camera,
  Compass,
  Zap,
  Activity,
  Heart
} from 'lucide-react';
import { soundFx } from '../utils/audio.js';

export const ControlDock = ({
  settings,
  onSettingsChange,
  onCameraPreset,
  onUploadImage,
  uploadedFileName,
  isAutoMorphing,
  onToggleAutoMorph,
  totalParticles,
  isCinematicOrbit,
  onToggleCinematicOrbit,
  onCaptureSnapshot,
  onRecordVideo,
  isRecordingVideo,
  recordProgress,
  aspectRatioMode,
  onChangeAspectRatio,
}) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // On mobile default to collapsed for maximum clean viewport
  const [isCollapsed, setIsCollapsed] = useState(() => isMobile);
  
  // Active tab: 'relief' | 'motion' | 'color'
  const [activeTab, setActiveTab] = useState('relief');

  // Ultra-translucent glass mode
  const [isUltraGlass, setIsUltraGlass] = useState(false);

  // Keyboard shortcut (H or Esc to collapse/expand)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const colorThemes = [
    { 
      id: 'true-rgb', 
      label: 'Asl Ranglar', 
      desc: 'Tabiiy rasm ranglari',
      swatch: 'bg-gradient-to-tr from-rose-500 via-amber-400 to-emerald-400' 
    },
    { 
      id: 'romantic-rose', 
      label: 'Romantik Pushti', 
      desc: 'Iliq atirgul & romantik jilo',
      swatch: 'bg-gradient-to-tr from-purple-700 via-rose-500 to-amber-200' 
    },
    { 
      id: 'sapphire-dream', 
      label: 'Moviy Trend', 
      desc: 'Moviy va tillarang nur',
      swatch: 'bg-gradient-to-tr from-blue-700 via-cyan-400 to-amber-300' 
    },
    { 
      id: 'pure-white', 
      label: 'Tiniq Oq', 
      desc: 'Kumushrang monoxrom',
      swatch: 'bg-white' 
    },
    { 
      id: 'matrix-green', 
      label: 'Matrix Yashil', 
      desc: 'Kiber neon yashil',
      swatch: 'bg-[#00ff66]' 
    },
    { 
      id: 'cyber-cyan', 
      label: 'Moviy Neon', 
      desc: 'Sovuq kiber neon',
      swatch: 'bg-[#00d0ff]' 
    },
  ];

  const particleStyles = [
    { id: 'prism', label: 'Kristall Piksel', desc: 'Qirrali 3D kublar' },
    { id: 'spheres', label: 'Yulduzli Zarra', desc: 'Yumshoq nurlar' },
    { id: 'glyphs', label: '0 va 1 Raqam', desc: 'Matritsa kodi' },
    { id: 'diamonds', label: 'Olmos Qirra', desc: '45° kristall' },
  ];

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[860px] px-2 sm:px-4 pointer-events-none select-none">
      <div className="pointer-events-auto flex flex-col items-center">
        
        {/* STATE 1: COLLAPSED — SINGLE SLEEK FLOATING CAPSULE */}
        {isCollapsed ? (
          <button
            onClick={() => {
              soundFx.playClick(settings.soundEnabled);
              setIsCollapsed(false);
            }}
            className="px-4 py-2.5 bg-black/80 hover:bg-black/95 border border-rose-500/70 hover:border-rose-400 rounded-full text-xs font-mono font-bold text-rose-300 backdrop-blur-xl flex items-center gap-2.5 transition-all shadow-2xl hover:shadow-rose-500/30 active:scale-95 cursor-pointer ring-1 ring-rose-500/30"
            title="3D Boshqaruv panelini ochish"
          >
            <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center">
              <Sliders size={12} className="text-rose-400" />
            </div>
            <span className="tracking-wide">3D Piksellar & Boshqaruv</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          </button>
        ) : (
          /* STATE 2: EXPANDED TRANSLUCENT HUD DOCK */
          <div 
            className={`w-full transition-all duration-300 rounded-2xl border shadow-2xl ${
              isUltraGlass 
                ? 'bg-black/25 backdrop-blur-xs border-rose-500/30 text-white' 
                : 'bg-black/75 backdrop-blur-xl border-rose-500/40 text-white'
            } p-2.5 sm:p-4 space-y-2.5 max-h-[75vh] md:max-h-[520px] overflow-y-auto`}
          >
            {/* Header: Title, Image Source, Glass Mode & 1-button minimize */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10 gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-400/80 flex items-center justify-center font-mono font-bold text-xs text-rose-400 shrink-0">
                  <Heart size={12} className="fill-rose-400 text-rose-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-mono font-bold text-rose-300 truncate">
                      3D Relyef & Piksellar
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      {totalParticles?.toLocaleString() || '12,500'} piksel
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-300 truncate block">
                    {uploadedFileName ? `Surat: ${uploadedFileName}` : 'Romantik model'}
                  </span>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Ultra-transparent Glass Mode Toggle */}
                <button
                  onClick={() => {
                    soundFx.playClick(settings.soundEnabled);
                    setIsUltraGlass((prev) => !prev);
                  }}
                  className={`px-2 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer ${
                    isUltraGlass 
                      ? 'bg-rose-500/30 border-rose-400 text-rose-300' 
                      : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-gray-300 hover:text-white'
                  }`}
                  title={isUltraGlass ? "Standart oynaga qaytish" : "Oʻta shaffof oyna (model toʻliq koʻrinadi)"}
                >
                  {isUltraGlass ? <Eye size={12} className="text-rose-400" /> : <EyeOff size={12} />}
                  <span className="hidden xs:inline">
                    {isUltraGlass ? 'Oʻta shaffof' : 'Shaffoflik'}
                  </span>
                </button>

                {/* Direct 1-Button Native Upload inside Dock */}
                <label className="px-2.5 py-1.5 bg-gradient-to-r from-rose-500/30 to-purple-500/30 hover:from-rose-500/40 hover:to-purple-500/40 border border-rose-400/60 rounded-lg text-[11px] font-mono font-bold text-rose-300 flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95">
                  <Upload size={12} className="text-rose-400" />
                  <span>Rasm</span>
                  <input
                    type="file"
                    accept="image/*,.heic,.heif,.HEIC,.HEIF"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onUploadImage) {
                        soundFx.playScan(settings.soundEnabled);
                        onUploadImage(file);
                      }
                      e.target.value = '';
                    }}
                    className="sr-only"
                  />
                </label>

                {/* 1 Button Shrink / Minimize Action */}
                <button
                  onClick={() => {
                    soundFx.playClick(settings.soundEnabled);
                    setIsCollapsed(true);
                  }}
                  className="px-2 sm:px-2.5 py-1.5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 hover:border-rose-400 rounded-lg text-[11px] font-mono text-gray-200 hover:text-rose-300 flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Menyuni bitta tugmaga yashirish"
                >
                  <Minimize2 size={12} className="text-rose-400" />
                  <span className="hidden sm:inline">Yashirish</span>
                </button>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="flex items-center gap-1 p-1 bg-black/50 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  soundFx.playClick(settings.soundEnabled);
                  setActiveTab('relief');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'relief'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                <Box size={13} className={activeTab === 'relief' ? 'text-rose-400' : ''} />
                <span>Piksellar & Tiniqlik</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick(settings.soundEnabled);
                  setActiveTab('motion');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'motion'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                <Compass size={13} className={activeTab === 'motion' ? 'text-rose-400' : ''} />
                <span>Animatsiyalar & Sayohat</span>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick(settings.soundEnabled);
                  setActiveTab('color');
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'color'
                    ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                }`}
              >
                <Palette size={13} className={activeTab === 'color' ? 'text-rose-400' : ''} />
                <span>Rang & Reels Eksport</span>
              </button>
            </div>

            {/* TAB 1: PIKSELLAR SONI, TINIQLIK VA RELYEF */}
            {activeTab === 'relief' && (
              <div className="space-y-2 animate-in fade-in duration-200">
                {/* Resolution (Piksellar soni / Zichlik) & Sharpness (Qirralashtirish) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Resolution Slider (Piksellarni ko'paytirish / kamaytirish) */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                    <div className="flex justify-between text-xs font-mono text-gray-200 mb-1">
                      <span className="text-rose-300 font-semibold flex items-center gap-1">
                        <Flame size={12} className="text-rose-400" />
                        Piksellar Zichligi (Soni)
                      </span>
                      <span className="text-rose-400 font-bold">
                        {settings.resolution}x{settings.resolution}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="160"
                      step="5"
                      value={settings.resolution}
                      onChange={(e) => onSettingsChange({ resolution: parseInt(e.target.value, 10) })}
                      className="w-full h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-rose-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1">
                      <span>Kamroq (Retro 35)</span>
                      <span>Oʻrtacha (90)</span>
                      <span>Juda tiniq (Ultra 160)</span>
                    </div>
                  </div>

                  {/* Sharpness (Qirralashtirish / Kontrast) */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                    <div className="flex justify-between text-xs font-mono text-gray-200 mb-1">
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <Zap size={12} className="text-amber-400" />
                        Qirralashtirish (Tiniqlik)
                      </span>
                      <span className="text-amber-400 font-bold">
                        {((settings.sharpness || 1.0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.05"
                      value={settings.sharpness || 1.0}
                      onChange={(e) => onSettingsChange({ sharpness: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-black/60 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-400 mt-1">
                      <span>Oddiy (100%)</span>
                      <span>Boʻrtgan yuz va koʻz qirralari (250%)</span>
                    </div>
                  </div>
                </div>

                {/* Particle Style Selector */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-2.5">
                  <div className="text-xs font-mono text-gray-300 mb-1.5 flex items-center justify-between">
                    <span className="text-rose-300 font-semibold">Piksel shakli:</span>
                    <span className="text-[10px] text-gray-400">
                      {particleStyles.find((p) => p.id === (settings.particleStyle || 'prism'))?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {particleStyles.map((style) => {
                      const isSelected = (settings.particleStyle || 'prism') === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => {
                            soundFx.playClick(settings.soundEnabled);
                            onSettingsChange({ particleStyle: style.id });
                          }}
                          className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer font-mono ${
                            isSelected
                              ? 'bg-rose-500/25 border-rose-400 text-white shadow-sm ring-1 ring-rose-500/40'
                              : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-300'
                          }`}
                        >
                          <div className="text-xs font-bold truncate flex items-center justify-between">
                            <span>{style.label}</span>
                            {isSelected && <Check size={11} className="text-rose-400 shrink-0" />}
                          </div>
                          <div className="text-[9px] text-gray-400 truncate">{style.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Depth Extrusion & Particle Size */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2">
                    <div className="flex justify-between text-xs font-mono text-gray-200 mb-1">
                      <span className="text-rose-300 font-semibold">3D Boʻrtish Hajmi</span>
                      <span className="text-rose-400 font-bold">{settings.depthExtrusion}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="75"
                      step="1"
                      value={settings.depthExtrusion}
                      onChange={(e) => onSettingsChange({ depthExtrusion: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-rose-400"
                    />
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-xl p-2">
                    <div className="flex justify-between text-xs font-mono text-gray-200 mb-1">
                      <span className="text-rose-300 font-semibold">Piksel Kattaligi</span>
                      <span className="text-rose-400 font-bold">{settings.pointSize}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="45"
                      step="1"
                      value={settings.pointSize}
                      onChange={(e) => onSettingsChange({ pointSize: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-rose-400"
                    />
                  </div>

                  {/* 2D -> 3D Morph */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2">
                    <div className="flex justify-between text-xs font-mono text-gray-200 mb-1">
                      <span className="text-rose-300 font-semibold">2D → 3D Morf</span>
                      <span className="text-rose-400 font-bold">{Math.round(settings.morphProgress * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={settings.morphProgress}
                      onChange={(e) => onSettingsChange({ morphProgress: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-black/60 rounded-lg appearance-none cursor-pointer accent-rose-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: VIRAL ANIMATSIYALAR & SAYOHAT */}
            {activeTab === 'motion' && (
              <div className="space-y-2 animate-in fade-in duration-200">
                {/* Viral Cinematic Orbit Banner */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-amber-950/40 border border-rose-500/40 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-rose-300">
                      <Sparkles size={13} className="text-rose-400" />
                      <span>Trend Sayohati (Kinematik Kamera)</span>
                      <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Viral
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-gray-300">
                      Kamera 3D relyef atrofida silliq aylanib, chuqurlikni ajoyib koʻrsatadi
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      onToggleCinematicOrbit();
                    }}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 shadow-md ${
                      isCinematicOrbit
                        ? 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400'
                        : 'bg-white/10 hover:bg-white/20 text-rose-300 border border-rose-400/40'
                    }`}
                  >
                    {isCinematicOrbit ? 'Toʻxtatish' : 'Sayohatni Yoqish'}
                  </button>
                </div>

                {/* Additional Live Animations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Alive Breathing / Pulse */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-rose-300 flex items-center gap-1">
                        <Heart size={12} className="text-rose-400" />
                        Nafas Olish
                      </span>
                      <button
                        onClick={() => {
                          soundFx.playClick(settings.soundEnabled);
                          onSettingsChange({ alivePulse: settings.alivePulse ? 0 : 0.8 });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                          settings.alivePulse
                            ? 'bg-rose-500/30 border-rose-400 text-rose-300'
                            : 'bg-white/[0.06] border-white/10 text-gray-400'
                        }`}
                      >
                        {settings.alivePulse ? 'Faol' : 'Oʻchiq'}
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400">
                      Suratni xuddi tirikdek mayin tebratadi
                    </p>
                  </div>

                  {/* Laser Scan Sweep */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-cyan-300 flex items-center gap-1">
                        <Zap size={12} className="text-cyan-400" />
                        Lazer Nuri
                      </span>
                      <button
                        onClick={() => {
                          soundFx.playScan(settings.soundEnabled);
                          onSettingsChange({ laserActive: !settings.laserActive });
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                          settings.laserActive
                            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300'
                            : 'bg-white/[0.06] border-white/10 text-gray-400'
                        }`}
                      >
                        {settings.laserActive ? 'Nur oqmoqda' : 'Yoqish'}
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400">
                      Relyef ustidan yorugʻlik nuri oʻtadi
                    </p>
                  </div>

                  {/* Auto 2D-3D Morph */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-semibold text-amber-300 flex items-center gap-1">
                        <Activity size={12} className="text-amber-400" />
                        Avto-Morf
                      </span>
                      <button
                        onClick={() => {
                          soundFx.playMorph(settings.soundEnabled);
                          onToggleAutoMorph();
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                          isAutoMorphing
                            ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                            : 'bg-white/[0.06] border-white/10 text-gray-400'
                        }`}
                      >
                        {isAutoMorphing ? 'Toʻxtatish' : 'Boshlash'}
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-gray-400">
                      2D dan 3D ga doimiy jonlanish
                    </p>
                  </div>
                </div>

                {/* Camera Angles */}
                <div className="flex items-center justify-between p-2 bg-black/40 border border-white/10 rounded-xl font-mono text-xs">
                  <span className="text-gray-400 text-[11px]">Kamera burchagi:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onCameraPreset('front')}
                      className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-white/10 text-gray-200 cursor-pointer"
                    >
                      Oldi
                    </button>
                    <button
                      onClick={() => onCameraPreset('isometric')}
                      className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-white/10 text-gray-200 cursor-pointer"
                    >
                      3D Relyef
                    </button>
                    <button
                      onClick={() => onCameraPreset('side')}
                      className="px-2.5 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 border border-white/10 text-gray-200 cursor-pointer"
                    >
                      Yon Tomon
                    </button>
                    <button
                      onClick={() => onCameraPreset('closeup')}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 cursor-pointer font-bold"
                    >
                      Yaqin (Zoom)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: RANG VA INSTAGRAM REELS EKSPORT */}
            {activeTab === 'color' && (
              <div className="space-y-2.5 animate-in fade-in duration-200">
                {/* Color Swatches */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-300 px-1">
                    <span className="font-semibold text-rose-300">Rang palitrasi:</span>
                    <span className="text-[10px] text-gray-400">
                      {settings.theme === 'true-rgb' ? 'Tabiiy ranglar (Asl)' : settings.theme}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {colorThemes.map((thm) => {
                      const isSelected = settings.theme === thm.id;
                      return (
                        <button
                          key={thm.id}
                          onClick={() => {
                            soundFx.playClick(settings.soundEnabled);
                            onSettingsChange({ theme: thm.id });
                          }}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-500/25 border-rose-400 text-white shadow-md ring-1 ring-rose-500/40'
                              : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-300'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full ${thm.swatch} shrink-0 border border-white/20`} />
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-mono font-semibold truncate">{thm.label}</div>
                            <div className="text-[9px] text-gray-400 truncate">{thm.desc}</div>
                          </div>
                          {isSelected && <Check size={11} className="text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}

                    {/* Custom Color Picker */}
                    <label
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        settings.theme === 'custom'
                          ? 'bg-rose-500/25 border-rose-400 text-white shadow-md ring-1 ring-rose-500/40'
                          : 'bg-black/30 border-white/10 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      <div 
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/30"
                        style={{ backgroundColor: settings.customColor || '#00ff88' }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono font-semibold truncate flex items-center gap-1">
                          <span>Maxsus rang</span>
                          <Pipette size={10} className="text-rose-400" />
                        </div>
                        <div className="text-[9px] text-gray-400 truncate">Tanlash</div>
                      </div>
                      <input
                        type="color"
                        value={settings.customColor || '#00ff88'}
                        onChange={(e) => {
                          onSettingsChange({
                            theme: 'custom',
                            customColor: e.target.value,
                          });
                        }}
                        className="w-0 h-0 opacity-0 sr-only"
                      />
                    </label>
                  </div>
                </div>

                {/* Aspect Ratio Framing for Social Media */}
                <div className="p-2.5 bg-black/40 border border-white/10 rounded-xl space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-xs text-gray-200">
                    <span className="font-semibold text-rose-300">Format (Reels / Post / Ekranga mos):</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onChangeAspectRatio('free')}
                      className={`py-1.5 px-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        aspectRatioMode === 'free'
                          ? 'bg-rose-500/25 border-rose-400 text-rose-300 font-bold'
                          : 'bg-gray-900 border-white/10 text-gray-400'
                      }`}
                    >
                      Toʻliq Ekran
                    </button>
                    <button
                      onClick={() => onChangeAspectRatio('9:16')}
                      className={`py-1.5 px-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        aspectRatioMode === '9:16'
                          ? 'bg-rose-500/25 border-rose-400 text-rose-300 font-bold'
                          : 'bg-gray-900 border-white/10 text-gray-400'
                      }`}
                    >
                      Reels (9:16)
                    </button>
                    <button
                      onClick={() => onChangeAspectRatio('1:1')}
                      className={`py-1.5 px-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        aspectRatioMode === '1:1'
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold'
                          : 'bg-gray-900 border-white/10 text-gray-400'
                      }`}
                    >
                      Kvadrat (1:1)
                    </button>
                  </div>
                </div>

                {/* Direct Video & Snapshot Export Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* High-Res Snapshot */}
                  <button
                    onClick={() => {
                      soundFx.playShutter(settings.soundEnabled);
                      onCaptureSnapshot(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-rose-500/40 text-rose-300 font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md"
                  >
                    <Download size={14} className="text-rose-400" />
                    <span>Ultra HD 4K Rasm Yuklash</span>
                  </button>

                  {/* Reel Video Recording Button */}
                  <button
                    disabled={isRecordingVideo}
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      onRecordVideo(6000); // 6 second viral reel loop
                    }}
                    className={`py-2.5 px-3 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
                      isRecordingVideo
                        ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                        : 'bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white border-rose-400/50 shadow-rose-500/25'
                    }`}
                  >
                    <Video size={14} />
                    <span>
                      {isRecordingVideo 
                        ? `Video yozilmoqda... (${recordProgress}%)` 
                        : 'Reels uchun Video (6 soniya)'}
                    </span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};
