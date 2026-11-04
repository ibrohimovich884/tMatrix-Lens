import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layers, 
  Camera, 
  Cpu, 
  ChevronUp, 
  ChevronDown, 
  Play, 
  Pause, 
  RotateCw,
  Sparkles,
  Sliders,
  SlidersHorizontal,
  Sun,
  Contrast,
  RotateCcw,
  X,
  Minimize2,
  Upload
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
}) => {
  // On mobile screens (< 768px), default to collapsed (single button) for seamless touch experience
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const [activeTab, setActiveTab] = useState('transform');

  // Listen to escape key to collapse
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const themes = [
    { id: 'matrix-green', label: 'Matrix Yashil', swatch: 'bg-[#00ff66]', glow: 'shadow-[#00ff66]/40' },
    { id: 'cyber-cyan', label: 'Cyber Cyan', swatch: 'bg-[#00f0ff]', glow: 'shadow-[#00f0ff]/40' },
    { id: 'amber-crt', label: 'Amber Terminal', swatch: 'bg-[#ffb000]', glow: 'shadow-[#ffb000]/40' },
    { id: 'true-rgb', label: 'Asl Rasm RGB', swatch: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500', glow: 'shadow-blue-500/40' },
    { id: 'red-alert', label: 'Red Alert', swatch: 'bg-[#ff2a6d]', glow: 'shadow-[#ff2a6d]/40' },
    { id: 'ghost-white', label: 'Holo Ghost', swatch: 'bg-[#e0f2fe]', glow: 'shadow-white/40' },
  ];

  const modes = [
    { id: 'hologram', label: '3D Relyef', desc: 'Yorqinlikka koʻra Z-chuqurlik' },
    { id: 'matrix-rain', label: 'Matrix Rain', desc: '0 va 1 larning oqib tushishi' },
    { id: 'dispersion', label: 'Scatter', desc: 'Zarrachalar sochilib ketishi' },
    { id: 'waves', label: 'Toʻlqinlar', desc: 'Silliq tebranishlar' },
    { id: 'sphere', label: 'Sfera', desc: '3D kiber-silindrga oʻralish' },
  ];

  const cameraViews = [
    { id: 'front', label: 'Oldi' },
    { id: 'isometric', label: 'Izometrik' },
    { id: 'top', label: 'Tepadan' },
    { id: 'dramatic', label: 'Pastki' },
    { id: 'closeup', label: 'Yaqin' },
  ];

  const resolutions = [
    { value: 64, label: '64x64', badge: '~4K (Tezkor)' },
    { value: 96, label: '96x96', badge: '~9K (Optimal)' },
    { value: 128, label: '128x128', badge: '~16K (Yuqori HD)' },
    { value: 160, label: '160x160', badge: '~25K (Ultra)' },
  ];

  return (
    <>
      {/* Semi-transparent backdrop when menu is open on mobile to easily close on tap */}
      {!isCollapsed && (
        <div 
          onClick={() => {
            soundFx.playClick(settings.soundEnabled);
            setIsCollapsed(true);
          }}
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[2px] md:hidden cursor-pointer"
        />
      )}

      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[940px] px-3 sm:px-4 pointer-events-none select-none">
        <div className="pointer-events-auto flex flex-col items-center">
          
          {/* STATE 1: COLLAPSED — ONLY 1 SINGLE SLEEK FLOATING BUTTON */}
          {isCollapsed ? (
            <button
              onClick={() => {
                soundFx.playClick(settings.soundEnabled);
                setIsCollapsed(false);
              }}
              className="px-4 py-2.5 bg-gray-950/95 hover:bg-gray-900 border border-emerald-500/60 hover:border-emerald-400 rounded-full text-xs font-mono font-bold text-emerald-400 backdrop-blur-xl flex items-center gap-2.5 transition-all shadow-2xl hover:shadow-emerald-500/20 active:scale-95 cursor-pointer ring-2 ring-emerald-500/20"
              title="Barcha sozlamalar menyusini ochish"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <Sliders size={12} className="text-emerald-400" />
              </div>
              <span className="tracking-wide">Sozlamalar (3D Menu)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          ) : (
            /* STATE 2: EXPANDED SETTINGS DRAWER */
            <div 
              className="w-full max-h-[82vh] md:max-h-[500px] overflow-y-auto bg-gray-950/95 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300"
            >
              {/* Header of Dock: Close / Shrink button down to 1 button */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-400">3D Matrix Sozlamalari</h4>
                    <span className="text-[10px] font-mono text-gray-400">{totalParticles.toLocaleString()} ta 0 va 1 zarrachasi</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Native Upload Button in ControlDock */}
                  <label className="px-2.5 sm:px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 hover:border-emerald-400 rounded-xl text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95">
                    <Upload size={13} className="text-emerald-400" />
                    <span className="hidden sm:inline">{uploadedFileName ? `Rasm: ${uploadedFileName}` : 'Oʻz rasmingizni yuklash'}</span>
                    <span className="sm:hidden">Rasm yuklash</span>
                    <input
                      type="file"
                      accept="image/*,.heic,.heif,.HEIC,.HEIF"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && onUploadImage) {
                          soundFx.playClick(settings.soundEnabled);
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
                    className="px-2.5 sm:px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-emerald-400 rounded-xl text-xs font-mono text-gray-300 hover:text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Menuni 1 ta tugmagacha qisqartirish"
                  >
                    <Minimize2 size={13} className="text-emerald-400" />
                    <span className="hidden sm:inline">1 ta tugmaga qisqartirish</span>
                    <span className="sm:hidden">Qisqartirish</span>
                  </button>
                </div>
              </div>

              {/* Top Row: Hero 3D Morph Progress Slider */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 py-3 border-b border-gray-800/80">
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 text-xs font-mono font-medium text-gray-300 shrink-0">
                  <span className="text-gray-400 text-[11px]">Tekis (2D)</span>
                  <button
                    onClick={() => {
                      soundFx.playMorph(settings.soundEnabled);
                      onToggleAutoMorph();
                    }}
                    className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono transition-all cursor-pointer ${
                      isAutoMorphing 
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                        : 'bg-gray-900 border-gray-700 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-300'
                    }`}
                    title={isAutoMorphing ? 'Toʻxtatish' : '2D va 3D oʻrtasida avto-animatsiya'}
                  >
                    {isAutoMorphing ? <Pause size={13} /> : <Play size={13} />}
                    <span>{isAutoMorphing ? 'Avto-animatsiya' : 'Animatsiya'}</span>
                  </button>
                </div>

                <div className="flex-1 w-full flex items-center gap-2.5">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.morphProgress}
                    onChange={(e) => {
                      if (isAutoMorphing) onToggleAutoMorph();
                      onSettingsChange({ morphProgress: parseFloat(e.target.value) });
                    }}
                    className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
                  />
                  <span className="text-xs font-mono font-bold text-emerald-400 w-10 text-right">
                    {Math.round(settings.morphProgress * 100)}%
                  </span>
                </div>

                <div className="text-xs font-mono font-medium text-emerald-400 shrink-0 hidden sm:flex items-center gap-1">
                  <Sparkles size={13} />
                  <span>3D Matrix</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex items-center justify-between gap-1 pt-2.5 pb-2.5 border-b border-gray-800/60 overflow-x-auto">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      setActiveTab('transform');
                    }}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'transform'
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                    }`}
                  >
                    <Sliders size={13} />
                    <span>3D Rejimlar</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      setActiveTab('theme');
                    }}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'theme'
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                    }`}
                  >
                    <Palette size={13} />
                    <span>Ranglar</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      setActiveTab('image');
                    }}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'image'
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                    }`}
                  >
                    <SlidersHorizontal size={13} />
                    <span>Rasm Sozlamalari</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      setActiveTab('camera');
                    }}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'camera'
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                    }`}
                  >
                    <Camera size={13} />
                    <span>Kamera</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      setActiveTab('grid');
                    }}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'grid'
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-semibold'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                    }`}
                  >
                    <Cpu size={13} />
                    <span>Sifat</span>
                  </button>
                </div>
              </div>

              {/* Tab Content Panes */}
              <div className="pt-3 min-h-[95px]">
                {/* Tab 1: 3D Transform & Modes */}
                {activeTab === 'transform' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2">
                      {modes.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            soundFx.playMorph(settings.soundEnabled);
                            onSettingsChange({ mode: m.id });
                          }}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                            settings.mode === m.id
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/10'
                              : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 text-gray-300 hover:bg-gray-900'
                          }`}
                        >
                          <span className="text-xs font-mono font-semibold">{m.label}</span>
                          <span className="text-[10px] text-gray-400 line-clamp-1">{m.desc}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span>3D Boʻrtish Chuqurligi</span>
                          <span className="text-emerald-400">{settings.depthExtrusion}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          step="1"
                          value={settings.depthExtrusion}
                          onChange={(e) => onSettingsChange({ depthExtrusion: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span>{settings.mode === 'matrix-rain' ? 'Yogʻish tezligi' : 'Toʻlqin kuchi'}</span>
                          <span className="text-emerald-400">
                            {settings.mode === 'matrix-rain' ? settings.rainSpeed.toFixed(1) : settings.waveIntensity.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={settings.mode === 'matrix-rain' ? settings.rainSpeed : settings.waveIntensity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (settings.mode === 'matrix-rain') {
                              onSettingsChange({ rainSpeed: val });
                            } else {
                              onSettingsChange({ waveIntensity: val });
                            }
                          }}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div className="flex items-center justify-start gap-2 pt-1">
                        <label className="text-xs font-mono text-gray-300 flex items-center gap-2 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={settings.invertLuminance}
                            onChange={(e) => {
                              soundFx.playClick(settings.soundEnabled);
                              onSettingsChange({ invertLuminance: e.target.checked });
                            }}
                            className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-emerald-500 focus:ring-0 cursor-pointer"
                          />
                          <span>Invert Chuqurlik</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Palette & Glyphs */}
                {activeTab === 'theme' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 sm:gap-2">
                      {themes.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => {
                            soundFx.playClick(settings.soundEnabled);
                            onSettingsChange({ theme: th.id });
                          }}
                          className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                            settings.theme === th.id
                              ? 'bg-gray-800/90 border-emerald-400 text-white shadow-lg'
                              : 'bg-gray-900/50 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full ${th.swatch} shadow ${th.glow} shrink-0`} />
                          <span className="text-xs font-mono truncate">{th.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span>0 va 1 Raqamlar Oʻlchami</span>
                          <span className="text-emerald-400">{settings.pointSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="38"
                          step="1"
                          value={settings.pointSize}
                          onChange={(e) => onSettingsChange({ pointSize: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span>Ikkilik miltillash (0 ⇄ 1)</span>
                          <span className="text-emerald-400">{settings.binaryFlipSpeed.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="0.2"
                          value={settings.binaryFlipSpeed}
                          onChange={(e) => onSettingsChange({ binaryFlipSpeed: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span>Neon Yorugʻlik (Bloom Glow)</span>
                          <span className="text-emerald-400">{Math.round(settings.bloomGlow * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1.5"
                          step="0.1"
                          value={settings.bloomGlow}
                          onChange={(e) => onSettingsChange({ bloomGlow: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Rasm Sozlamalari (Image Adjustments) */}
                {activeTab === 'image' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Brightness */}
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span className="flex items-center gap-1"><Sun size={12} className="text-emerald-400" /> Yorqinlik</span>
                          <span className="text-emerald-400 font-bold">{Math.round((settings.brightness ?? 0) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="-0.4"
                          max="0.4"
                          step="0.02"
                          value={settings.brightness ?? 0.0}
                          onChange={(e) => onSettingsChange({ brightness: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      {/* Contrast */}
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span className="flex items-center gap-1"><Contrast size={12} className="text-emerald-400" /> Kontrast</span>
                          <span className="text-emerald-400 font-bold">{(settings.contrast ?? 1.15).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={settings.contrast ?? 1.15}
                          onChange={(e) => onSettingsChange({ contrast: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      {/* 0 vs 1 Threshold / Density */}
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span>0 ⇄ 1 Zichligi</span>
                          <span className="text-emerald-400 font-bold">{Math.round((settings.threshold ?? 0.5) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.02"
                          value={settings.threshold ?? 0.5}
                          onChange={(e) => onSettingsChange({ threshold: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>

                      {/* 3D Depth Curve / Gamma */}
                      <div>
                        <div className="flex justify-between text-xs font-mono text-gray-300 mb-1">
                          <span>3D Relyef Egri Chizigʻi</span>
                          <span className="text-emerald-400 font-bold">{(settings.gammaCurve ?? 1.0).toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.2"
                          step="0.05"
                          value={settings.gammaCurve ?? 1.0}
                          onChange={(e) => onSettingsChange({ gammaCurve: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>
                    </div>

                    {/* Checkboxes & Reset */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-gray-800/60">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="text-xs font-mono text-gray-300 flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!settings.filterDarkBg}
                            onChange={(e) => {
                              soundFx.playClick(settings.soundEnabled);
                              onSettingsChange({ filterDarkBg: e.target.checked });
                            }}
                            className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-emerald-500 focus:ring-0 cursor-pointer"
                          />
                          <span>Qora fonni tozalash (Faqat obyekt qolsin)</span>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          soundFx.playClick(settings.soundEnabled);
                          onSettingsChange({
                            brightness: 0.0,
                            contrast: 1.15,
                            threshold: 0.5,
                            gammaCurve: 1.0,
                            filterDarkBg: false,
                          });
                        }}
                        className="px-2.5 py-1 text-[11px] font-mono text-gray-400 hover:text-emerald-300 hover:bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Rasm parametrlarini standart holatga qaytarish"
                      >
                        <RotateCcw size={11} />
                        <span>Standartga qaytarish</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 3: Camera Views */}
                {activeTab === 'camera' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3.5">
                    <div className="grid grid-cols-3 sm:flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                      {cameraViews.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            soundFx.playClick(settings.soundEnabled);
                            onCameraPreset(c.id);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/40 text-xs font-mono text-gray-300 hover:text-emerald-300 transition-all cursor-pointer text-center"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => {
                          soundFx.playClick(settings.soundEnabled);
                          onSettingsChange({ autoRotate: !settings.autoRotate });
                        }}
                        className={`w-full sm:w-auto px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          settings.autoRotate
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <RotateCw size={13} className={settings.autoRotate ? 'animate-spin' : ''} />
                        <span>Avto-aylanish: {settings.autoRotate ? 'YONIQ' : 'OʻCHIQ'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 4: Resolution & Performance */}
                {activeTab === 'grid' && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 w-full sm:w-auto">
                      {resolutions.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => {
                            soundFx.playClick(settings.soundEnabled);
                            onSettingsChange({ resolution: r.value });
                          }}
                          className={`p-2 rounded-xl border flex flex-col text-left transition-all cursor-pointer ${
                            settings.resolution === r.value
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          <span className="text-xs font-mono font-bold">{r.label}</span>
                          <span className="text-[10px] text-gray-500">{r.badge}</span>
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] font-mono text-gray-400 bg-gray-900/60 p-2 rounded-xl border border-gray-800/80">
                      <div className="text-emerald-400 font-semibold mb-0.5">3D WebGL Matrix Engine</div>
                      <div>Shaders: Dual Glyph Point Atlas</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
