import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layers, 
  Camera, 
  Play, 
  Pause, 
  RotateCw,
  Sparkles,
  Sliders,
  Sun,
  Contrast,
  Minimize2,
  Upload,
  Pipette,
  Check
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
  // On mobile screens (< 768px), default to collapsed (single button) for clean viewport
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

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

  const colorThemes = [
    { 
      id: 'true-rgb', 
      label: 'Asl Ranglar', 
      desc: 'Tabiiy rasm (hech qanday koʻkimtir tus yoʻq)',
      swatch: 'bg-gradient-to-tr from-rose-500 via-amber-400 to-emerald-400' 
    },
    { 
      id: 'pure-white', 
      label: 'Tiniq Oq', 
      desc: 'Monoxrom oppoq 0 va 1 lar',
      swatch: 'bg-white' 
    },
    { 
      id: 'matrix-green', 
      label: 'Matrix Yashil', 
      desc: 'Klassik kiber yashil',
      swatch: 'bg-[#00ff66]' 
    },
    { 
      id: 'amber-gold', 
      label: 'Oltin Qahrabo', 
      desc: 'Issiq oltin nuri',
      swatch: 'bg-[#ffb000]' 
    },
    { 
      id: 'cyber-cyan', 
      label: 'Moviy Neon', 
      desc: 'Sovuq koʻk neon',
      swatch: 'bg-[#00d0ff]' 
    },
    { 
      id: 'red-alert', 
      label: 'Qizil', 
      desc: 'Kiber qizil',
      swatch: 'bg-[#ff2a6d]' 
    },
  ];

  const modes = [
    { id: 'hologram', label: '3D Relyef', desc: 'Rasmning 3D hajmi' },
    { id: 'matrix-rain', label: 'Matrix Rain', desc: '0 va 1 yogʻishi' },
    { id: 'waves', label: 'Toʻlqinlar', desc: '3D tebranish' },
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

      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[820px] px-3 sm:px-4 pointer-events-none select-none">
        <div className="pointer-events-auto flex flex-col items-center">
          
          {/* STATE 1: COLLAPSED — ONLY 1 SINGLE SLEEK FLOATING BUTTON (ideal for mobile) */}
          {isCollapsed ? (
            <button
              onClick={() => {
                soundFx.playClick(settings.soundEnabled);
                setIsCollapsed(false);
              }}
              className="px-4 py-2.5 bg-gray-950/95 hover:bg-gray-900 border border-emerald-500/70 hover:border-emerald-400 rounded-full text-xs font-mono font-bold text-emerald-400 backdrop-blur-xl flex items-center gap-2.5 transition-all shadow-2xl hover:shadow-emerald-500/20 active:scale-95 cursor-pointer ring-2 ring-emerald-500/20"
              title="Sozlamalar menyusini ochish"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                <Sliders size={12} className="text-emerald-400" />
              </div>
              <span className="tracking-wide">Sozlamalar (3D Menu)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          ) : (
            /* STATE 2: STREAMLINED SETTINGS DRAWER */
            <div 
              className="w-full max-h-[82vh] md:max-h-[520px] overflow-y-auto bg-gray-950/95 border border-emerald-500/40 rounded-2xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 space-y-3.5"
            >
              {/* Header: Title, Image upload & Minimize to 1 button */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-400">3D Rasm Sozlamalari</h4>
                    <span className="text-[10px] font-mono text-gray-400">
                      {uploadedFileName ? `Yuklangan: ${uploadedFileName}` : 'Namunaviy 3D model'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Upload button inside drawer */}
                  <label className="px-2.5 sm:px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/60 hover:border-emerald-400 rounded-xl text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95">
                    <Upload size={13} className="text-emerald-400" />
                    <span className="hidden sm:inline">Rasm yuklash</span>
                    <span className="sm:hidden">Yuklash</span>
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

              {/* Slider 1: 2D <-> 3D 0 va 1 Darajasi */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-2.5 flex flex-col sm:flex-row items-center gap-2.5">
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 text-xs font-mono font-medium text-gray-300 shrink-0">
                  <span className="text-gray-400 text-[11px]">Tekis 2D</span>
                  <button
                    onClick={() => {
                      soundFx.playMorph(settings.soundEnabled);
                      onToggleAutoMorph();
                    }}
                    className={`px-2 py-1 rounded-lg border text-xs flex items-center gap-1 font-mono transition-all cursor-pointer ${
                      isAutoMorphing 
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' 
                        : 'bg-gray-900 border-gray-700 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-300'
                    }`}
                  >
                    {isAutoMorphing ? <Pause size={12} /> : <Play size={12} />}
                    <span>{isAutoMorphing ? 'Toʻxtatish' : 'Avto-animatsiya'}</span>
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
                    className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-400 focus:outline-none"
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

              {/* SECTION 1: RANG SOZLAMALARI (Fixes blueish tint and gives full color control) */}
              <div className="bg-gray-900/40 border border-gray-800/90 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
                    <Palette size={14} className="text-emerald-400" />
                    <span>Rang Sozlamasi (Rasm tusini tanlash)</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">
                    {settings.theme === 'true-rgb' ? 'Asl tabiiy ranglar' : settings.theme === 'custom' ? 'Maxsus rang' : settings.theme}
                  </span>
                </div>

                {/* Color Theme Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {colorThemes.map((thm) => {
                    const isSelected = settings.theme === thm.id;
                    return (
                      <button
                        key={thm.id}
                        onClick={() => {
                          soundFx.playClick(settings.soundEnabled);
                          onSettingsChange({ theme: thm.id });
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md ring-1 ring-emerald-500/40'
                            : 'bg-gray-900/70 border-gray-800 hover:border-gray-700 text-gray-300 hover:bg-gray-900'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${thm.swatch} shrink-0 border border-white/20`} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-mono font-semibold truncate">{thm.label}</div>
                          <div className="text-[9px] text-gray-400 truncate">{thm.desc}</div>
                        </div>
                        {isSelected && <Check size={12} className="text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}

                  {/* 7th Option: CUSTOM COLOR PICKER */}
                  <label
                    className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      settings.theme === 'custom'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-gray-900/70 border-gray-800 hover:border-gray-700 text-gray-300 hover:bg-gray-900'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full shrink-0 border border-white/30"
                      style={{ backgroundColor: settings.customColor || '#00ff88' }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-mono font-semibold truncate flex items-center gap-1">
                        <span>Oʻz Rangingiz</span>
                        <Pipette size={10} className="text-emerald-400" />
                      </div>
                      <div className="text-[9px] text-gray-400 truncate">Ixtiyoriy rang tanlang</div>
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

              {/* SECTION 2: 3D CHUQURLIK VA 0/1 O'LCHAMI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-gray-900/40 border border-gray-800/90 rounded-xl p-2.5">
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                    <span className="font-semibold text-emerald-300">3D Boʻrtish Chuqurligi</span>
                    <span className="text-emerald-400 font-bold">{settings.depthExtrusion}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="1"
                    value={settings.depthExtrusion}
                    onChange={(e) => onSettingsChange({ depthExtrusion: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                    <span>Tekis (0)</span>
                    <span>Chuqur 3D relief (80)</span>
                  </div>
                </div>

                <div className="bg-gray-900/40 border border-gray-800/90 rounded-xl p-2.5">
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                    <span className="font-semibold text-emerald-300">0 va 1 Hajmi</span>
                    <span className="text-emerald-400 font-bold">{settings.pointSize}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="1"
                    value={settings.pointSize}
                    onChange={(e) => onSettingsChange({ pointSize: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-1">
                    <span>Mayda piksellar</span>
                    <span>Katta 0 va 1 belgilar</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: YORQINLIK, KONTRAST VA 0/1 ZICHLIGI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-gray-900/40 border border-gray-800/90 rounded-xl p-2.5">
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                    <span className="text-gray-300">Yorqinlik</span>
                    <span className="text-emerald-400 font-mono">{settings.brightness > 0 ? `+${settings.brightness.toFixed(2)}` : settings.brightness.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-0.4"
                    max="0.4"
                    step="0.02"
                    value={settings.brightness}
                    onChange={(e) => onSettingsChange({ brightness: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                <div className="bg-gray-900/40 border border-gray-800/90 rounded-xl p-2.5">
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                    <span className="text-gray-300">Kontrast</span>
                    <span className="text-emerald-400 font-mono">{settings.contrast.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={settings.contrast}
                    onChange={(e) => onSettingsChange({ contrast: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>

                <div className="bg-gray-900/40 border border-gray-800/90 rounded-xl p-2.5">
                  <div className="flex justify-between text-xs font-mono text-gray-300 mb-1.5">
                    <span className="text-gray-300">0 va 1 Taqsimoti</span>
                    <span className="text-emerald-400 font-mono">{Math.round(settings.threshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.02"
                    value={settings.threshold}
                    onChange={(e) => onSettingsChange({ threshold: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              </div>

              {/* SECTION 4: 3D REJIM VA TEZKOR BOSHQARUV */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-gray-800/80">
                {/* 3D Modes */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-[11px] font-mono text-gray-400 shrink-0 mr-1">Rejim:</span>
                  {modes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundFx.playMorph(settings.soundEnabled);
                        onSettingsChange({ mode: m.id });
                      }}
                      className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all cursor-pointer ${
                        settings.mode === m.id
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Camera presets & auto-rotate */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      onSettingsChange({ autoRotate: !settings.autoRotate });
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
                      settings.autoRotate
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400'
                    }`}
                    title="Modelni sekin avtomatik aylantirish"
                  >
                    <RotateCw size={12} className={settings.autoRotate ? 'animate-spin' : ''} />
                    <span>Aylanish</span>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      onCameraPreset('front');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/40 text-xs font-mono text-gray-300 transition-all cursor-pointer"
                    title="Old tomonga qaytarish"
                  >
                    Oldi
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(settings.soundEnabled);
                      onCameraPreset('isometric');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/40 text-xs font-mono text-gray-300 transition-all cursor-pointer"
                    title="Izometrik burchakdan koʻrish"
                  >
                    Burchak
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};
