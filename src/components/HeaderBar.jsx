import React, { useRef, useState } from 'react';
import { 
  Upload, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Download, 
  HelpCircle, 
  X, 
  RotateCcw,
  Sparkles,
  Heart,
  Flame
} from 'lucide-react';
import { PRESET_IMAGES } from '../utils/presetImages.js';
import { soundFx } from '../utils/audio.js';

export const HeaderBar = ({
  currentPresetId,
  onSelectPreset,
  onUploadImage,
  isWebcamActive,
  onToggleWebcam,
  soundEnabled,
  onToggleSound,
  onCaptureSnapshot,
  onResetView,
  fps,
  uploadedFileName,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playScan(soundEnabled);
      onUploadImage(file);
    }
    e.target.value = '';
  };

  return (
    <>
      <header className="fixed top-2.5 inset-x-0 z-30 px-2 sm:px-4 pointer-events-none select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Left: Branding */}
          <div className="pointer-events-auto flex items-center gap-2 bg-gray-950/90 border border-rose-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 backdrop-blur-md shadow-xl shrink-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-500/25 to-amber-500/25 border border-rose-400/80 flex items-center justify-center text-rose-400">
              <Heart size={14} className="fill-rose-400/70 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs sm:text-sm tracking-wider bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  Trend 3D
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 hidden xs:inline flex items-center gap-0.5">
                  <Flame size={10} className="text-rose-400" />
                  Trend
                </span>
              </div>
            </div>
          </div>

          {/* Center: 1 SINGLE EFFECT-STYLED UPLOAD BUTTON + Quick Presets */}
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 bg-gray-950/90 border border-rose-500/35 rounded-xl p-1 backdrop-blur-md shadow-xl">
            {/* 1 SINGLE GLOWING EFFECT UPLOAD BUTTON (Opens native file picker directly) */}
            <label
              className="relative group px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 overflow-hidden bg-gradient-to-r from-rose-500 via-purple-600 to-cyan-500 hover:from-rose-400 hover:via-purple-500 hover:to-cyan-400 text-white border border-rose-300/40 shadow-rose-500/25"
              title="Oʻz sevimli rasmingizni yuklang (JPG, PNG, HEIC)"
            >
              {/* Shimmer sweep animation */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              <Upload size={14} className="text-white shrink-0 group-hover:-translate-y-0.5 transition-transform" />
              <span className="truncate max-w-[110px] sm:max-w-[160px] tracking-wide">
                {uploadedFileName ? uploadedFileName : 'Rasm Yuklash'}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping shrink-0" />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif,.HEIC,.HEIF"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {/* Presets Button */}
            <div className="relative">
              <button
                onClick={() => {
                  soundFx.playClick(soundEnabled);
                  setShowPresetMenu(!showPresetMenu);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-gray-200 hover:text-rose-300 hover:bg-gray-900 border border-gray-800 flex items-center gap-1.5 cursor-pointer transition-all"
                title="Namunaviy romantik modellar"
              >
                <Sparkles size={13} className="text-rose-400" />
                <span className="hidden sm:inline">Namunalar</span>
              </button>

              {/* Presets Popover Menu */}
              {showPresetMenu && (
                <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-52 bg-gray-950 border border-rose-500/40 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl z-50">
                  <div className="text-[10px] font-mono text-gray-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                    <span>Modellar:</span>
                    <span className="text-rose-400 font-bold">4 ta</span>
                  </div>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundFx.playClick(soundEnabled);
                        onSelectPreset(preset.id);
                        setShowPresetMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        currentPresetId === preset.id && !isWebcamActive
                          ? 'bg-rose-500/20 text-rose-300 font-bold'
                          : 'text-gray-300 hover:bg-gray-900'
                      }`}
                    >
                      <div>
                        <div>{preset.name}</div>
                        <div className="text-[9px] text-gray-400">{preset.tag}</div>
                      </div>
                      {currentPresetId === preset.id && !isWebcamActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Camera Button */}
            <button
              onClick={() => {
                soundFx.playMorph(soundEnabled);
                onToggleWebcam();
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                isWebcamActive
                  ? 'bg-rose-500/25 border border-rose-400 text-rose-300 shadow-sm'
                  : 'text-gray-300 hover:text-rose-300 hover:bg-gray-900'
              }`}
              title="Jonli selfi kamera 3D relyefi"
            >
              {isWebcamActive ? <VideoOff size={14} /> : <Video size={14} />}
              <span className="hidden md:inline">{isWebcamActive ? 'Kamera Oʻchiq' : 'Kamera'}</span>
            </button>
          </div>

          {/* Right: Actions, Snapshot, Audio */}
          <div className="pointer-events-auto flex items-center gap-1 bg-gray-950/90 border border-gray-800 rounded-xl p-1 backdrop-blur-md shadow-xl shrink-0">
            {/* Reset View Button */}
            <button
              onClick={() => {
                soundFx.playClick(soundEnabled);
                onResetView();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-900 text-gray-400 hover:text-gray-200 transition-all cursor-pointer"
              title="Kamerani boshlangʻich holatga qaytarish"
            >
              <RotateCcw size={14} />
            </button>

            {/* Snapshot PNG Download */}
            <button
              onClick={() => {
                soundFx.playShutter(soundEnabled);
                onCaptureSnapshot(false);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/40 rounded-lg text-xs font-mono text-rose-300 flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
              title="3D rasmni saqlab olish (PNG)"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Saqlash</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                soundFx.playClick(!soundEnabled);
              }}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                soundEnabled ? 'text-rose-400 hover:bg-gray-900' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
              }`}
              title={soundEnabled ? 'Ovozni oʻchirish' : 'Ovozni yoqish'}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>

            {/* Help modal */}
            <button
              onClick={() => {
                soundFx.playClick(soundEnabled);
                setShowHelp(true);
              }}
              className="p-1.5 rounded-lg hover:bg-gray-900 text-gray-400 hover:text-gray-200 transition-all cursor-pointer hidden xs:block"
              title="Qoʻllanma"
            >
              <HelpCircle size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
          <div className="max-w-md w-full bg-gray-950 border border-rose-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-gray-200">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400">
                <Heart size={16} className="fill-rose-400/80 text-rose-400" />
              </div>
              <div>
                <h3 className="font-mono font-bold text-base text-rose-400">Trend 3D Obʼyekt</h3>
                <p className="text-xs text-gray-400">Instagram & Telegram Trend 3D Relyef</p>
              </div>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800 space-y-1.5">
                <div className="text-rose-300 font-semibold uppercase tracking-wider text-[11px]">Qoʻllanma:</div>
                <p className="text-gray-300">
                  <span className="text-rose-400 font-bold">«Rasm Yuklash»</span> tugmasini bosing va oʻzingiz yoqtirgan insoningiz rasmini tanlang. U lahzada 3D relyinga aylanadi.
                </p>
                <p className="text-gray-300">
                  Pastdagi <span className="text-rose-400 font-bold">«Piksellar Zichligi»</span> slayderi orqali piksellar sonini koʻpaytirishingiz yoki kamaytirishingiz mumkin.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-4 w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400 rounded-xl font-mono text-xs font-bold text-rose-300 transition-all cursor-pointer"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </>
  );
};
