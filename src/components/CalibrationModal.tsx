import React, { useState } from 'react';
import { TileCoord } from '../types';
import { Crosshair, Copy, Check, RotateCcw, X, Play } from 'lucide-react';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tileCoords: TileCoord[];
  currentTargetTile: number;
  onSelectTargetTile: (tile: number) => void;
  onApplyCoords: (newCoords: TileCoord[]) => void;
  onResetCoords: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  isOpen,
  onClose,
  tileCoords,
  currentTargetTile,
  onSelectTargetTile,
  onApplyCoords,
  onResetCoords,
}) => {
  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState('');

  // Update text JSON saat tileCoords berubah
  React.useEffect(() => {
    setJsonText(JSON.stringify(tileCoords, null, 2));
  }, [tileCoords]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onApplyCoords(parsed);
      }
    } catch {
      // JSON tidak valid
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-2xl border border-amber-500/40 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Crosshair className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide">
                Mode Kalibrasi Koordinat Petak
              </h2>
              <p className="text-xs text-stone-400">
                Klik papan untuk merekam posisi (x, y) dalam persen.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Petunjuk Penggunaan */}
        <div className="my-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-200">
          <p className="font-semibold mb-1">Cara Mengkalibrasi:</p>
          <ol className="list-decimal list-inside space-y-1 text-stone-300 text-[11px]">
            <li>
              Pilih nomor petak yang ingin diatur (saat ini:{' '}
              <span className="text-amber-400 font-bold">
                Petak #{currentTargetTile}
              </span>
              ).
            </li>
            <li>Klik titik tengah petak tersebut pada gambar papan.</li>
            <li>
              Setelah diklik, sistem otomatis merekam koordinat dan berpindah ke petak berikutnya.
            </li>
            <li>
              Salin teks JSON di bawah untuk ditempelkan ke array{' '}
              <code className="text-amber-300 font-mono">TILE_COORDS</code>.
            </li>
          </ol>
        </div>

        {/* Selector Petak 1-30 */}
        <div className="mb-3">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
            Pilih Petak Target (1-30):
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {tileCoords.map((coord) => {
              const isSelected = coord.tile === currentTargetTile;
              return (
                <button
                  key={coord.tile}
                  onClick={() => onSelectTargetTile(coord.tile)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-bold font-mono transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 scale-105 shadow-md'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  {coord.tile}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tampilan JSON Koordinat */}
        <div className="flex-1 min-h-[160px] flex flex-col mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              Hasil JSON (TILE_COORDS):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs py-1 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin JSON'}</span>
              </button>

              <button
                onClick={onResetCoords}
                className="flex items-center gap-1.5 text-xs py-1 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Awal</span>
              </button>
            </div>
          </div>

          <textarea
            value={jsonText}
            onChange={handleTextChange}
            className="w-full flex-1 p-3 bg-stone-950 font-mono text-[11px] text-amber-200/90 rounded-xl border border-stone-800 focus:outline-none focus:border-amber-500 resize-none"
            spellCheck={false}
          />
        </div>

        {/* Footer Tombol Aksi */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-800">
          <button
            onClick={handleApplyJson}
            className="flex items-center gap-2 text-xs py-2 px-4 rounded-xl bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Terapkan Koordinat Langsung</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs py-2 px-5 rounded-xl bg-stone-800 text-stone-200 font-bold hover:bg-stone-700 transition-colors"
          >
            Tutup & Lanjutkan Game
          </button>
        </div>
      </div>
    </div>
  );
};
