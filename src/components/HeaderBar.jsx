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
  Image as ImageIcon
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
  const fileInputRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      soundFx.playClick(soundEnabled);
      onUploadImage(file);
    }
    e.target.value = '';
  };

  return (
    <>
      <header className="fixed top-2.5 inset-x-0 z-30 px-2 sm:px-4 pointer-events-none select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left: Branding & Spec Badge */}
          <div className="pointer-events-auto flex items-center gap-2 bg-gray-950/90 border border-emerald-500/30 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 backdrop-blur-md shadow-xl shrink-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-emerald-400">
              01
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-mono font-bold text-xs sm:text-sm tracking-wider text-emerald-400">
                  tMatrix
                </span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 hidden xs:inline">
                  3D
                </span>
              </div>
            </div>
          </div>

          {/* Center: Image Upload & Preset options */}
          <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-gray-950/90 border border-emerald-500/30 rounded-xl p-1 backdrop-blur-md shadow-xl">
            {/* High-visibility Native Label Upload Button (works 100% on iOS, Android, Desktop) */}
            <label
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                currentPresetId === 'custom'
                  ? 'bg-emerald-500 text-black border border-emerald-400 shadow-emerald-500/25'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 hover:border-emerald-400'
              }`}
              title="Oʻz rasmingizni tanlang yoki yuklang"
            >
              <Upload size={13} className={currentPresetId === 'custom' ? 'text-black' : 'text-emerald-400'} />
              <span className="truncate max-w-[85px] sm:max-w-[130px]">
                {currentPresetId === 'custom' ? (uploadedFileName || 'Rasm') : 'Rasm yuklash'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {/* Presets Button for Mobile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="px-2 py-1.5 rounded-lg text-xs font-mono text-gray-300 hover:text-emerald-300 hover:bg-gray-900 border border-gray-800 flex items-center gap-1 cursor-pointer transition-all"
                title="Namunaviy rasmlar"
              >
                <ImageIcon size={13} className="text-emerald-400" />
                <span className="hidden sm:inline">Namunalar</span>
              </button>

              {/* Presets Popover Menu */}
              {showPresetMenu && (
                <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-44 bg-gray-950 border border-emerald-500/40 rounded-xl p-1.5 shadow-2xl backdrop-blur-xl z-50">
                  <div className="text-[10px] font-mono text-gray-400 px-2 py-1 uppercase tracking-wider">Namunalar:</div>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        soundFx.playClick(soundEnabled);
                        onSelectPreset(preset.id);
                        setShowPresetMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        currentPresetId === preset.id && !isWebcamActive
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'text-gray-300 hover:bg-gray-900'
                      }`}
                    >
                      <span>{preset.name}</span>
                      {currentPresetId === preset.id && !isWebcamActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Camera Lens Button */}
            <button
              onClick={() => {
                soundFx.playMorph(soundEnabled);
                onToggleWebcam();
              }}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                isWebcamActive
                  ? 'bg-red-500/25 border border-red-400 text-red-300 shadow-sm'
                  : 'text-gray-300 hover:text-emerald-300 hover:bg-gray-900'
              }`}
              title="Jonli veb-kamera Matrix Lens rejimini yoqish/oʻchirish"
            >
              {isWebcamActive ? <VideoOff size={14} /> : <Video size={14} />}
              <span className="hidden md:inline">{isWebcamActive ? 'Kamera Oʻchirish' : 'Kamera'}</span>
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
                soundFx.playClick(soundEnabled);
                onCaptureSnapshot();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
              title="3D rasmni yuklab olish (PNG)"
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
                soundEnabled ? 'text-emerald-400 hover:bg-gray-900' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
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
          <div className="max-w-md w-full bg-gray-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-gray-200">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
                01
              </div>
              <div>
                <h3 className="font-mono font-bold text-base text-emerald-400">tMatrix-Lens</h3>
                <p className="text-xs text-gray-400">3D Binary Metamorphosis</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800 space-y-2">
                <div className="text-emerald-300 font-semibold uppercase tracking-wider text-[11px]">3D Boshqaruv (Sensorli & Sichqoncha):</div>
                <ul className="space-y-1 text-gray-300">
                  <li><span className="text-emerald-400 font-bold">1 barmoq / Chap tugma:</span> 3D fazoda aylantirish (Rotate)</li>
                  <li><span className="text-emerald-400 font-bold">2 barmoq (Pinch) / Gʻildirak:</span> Yaqinlashtirish (Zoom)</li>
                  <li><span className="text-emerald-400 font-bold">2 barmoq bilan surish:</span> Koʻchirish (Pan)</li>
                </ul>
              </div>

              <div className="bg-gray-900/60 p-3.5 rounded-xl border border-gray-800 space-y-2">
                <div className="text-emerald-300 font-semibold uppercase tracking-wider text-[11px]">Qulaylik:</div>
                <p className="text-gray-300">
                  Pastdagi barcha sozlamalarni <span className="text-emerald-400 font-bold">«1 ta tugmaga qisqartirish»</span> orqali yashirib, butun ekranni faqat 3D rasm uchun boʻshatishingiz mumkin.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-5 w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400 rounded-xl font-mono text-xs font-bold text-emerald-300 transition-all cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </>
  );
};
