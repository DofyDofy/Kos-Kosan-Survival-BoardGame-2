import React from 'react';
import { X, CheckCircle2, AlertTriangle, Bug } from 'lucide-react';
import { CARDS } from '../constants';
import { formatRupiah } from '../utils/format';
import { CardDef } from '../types';

interface DebugCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebugCardsModal: React.FC<DebugCardsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const validateCard = (card: CardDef) => {
    if (card.category === 'REZEKI' && card.amount <= 0) {
      return { valid: false, message: 'Rezeki harus bernilai positif (+)' };
    }
    if (card.category === 'PENGELUARAN' && card.amount >= 0) {
      return { valid: false, message: 'Pengeluaran harus bernilai negatif (-)' };
    }
    return { valid: true, message: 'Valid' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-stone-900 text-stone-100 rounded-3xl p-5 md:p-6 shadow-2xl border border-stone-700 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Bug className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black uppercase tracking-wide text-white">
                  Mode Debug: Verifikasi 15 Kartu Event
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-700 font-mono font-bold">
                  15 Kartu Terdaftar
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Pemeriksaan berdampingan: Gambar Asli, File, Judul, Kategori, dan Efek Nominal
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

        {/* Legend Filter Info */}
        <div className="my-3 p-3 rounded-2xl bg-stone-950/60 border border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              6 Pengeluaran (-Rp30.000 s/d -Rp100.000)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              5 Rezeki (+Rp20.000 s/d +Rp50.000)
            </span>
            <span className="flex items-center gap-1.5 text-purple-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              4 Kejadian Unik
            </span>
          </div>

          <div className="text-[11px] text-stone-400 font-mono">
            Petak 21-30 hanya menarik Pengeluaran &ge; Rp50.000 (01, 02, 03, 06)
          </div>
        </div>

        {/* Grid 15 Cards Side-by-Side */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CARDS.map((card) => {
              const validation = validateCard(card);
              return (
                <div
                  key={card.id}
                  className="p-3 rounded-2xl bg-stone-800/60 hover:bg-stone-800/90 border border-stone-700/80 flex gap-3 transition-colors"
                >
                  {/* Thumbnail Kartu Gambar Asli */}
                  <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-stone-950 border border-stone-700 relative shadow-md">
                    <img
                      src={card.file ? `/${card.file}` : card.image}
                      alt={card.title}
                      className="w-full h-full object-contain select-none"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/assets/aistudio/${card.file}`;
                      }}
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-stone-900/90 text-[9px] font-mono font-bold text-center py-0.5 text-amber-300 border-t border-stone-700 truncate px-1">
                      {card.file}
                    </div>
                  </div>

                  {/* Informasi Kartu */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Badge Kategori & Validasi */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            card.category === 'REZEKI'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : card.category === 'PENGELUARAN'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          {card.categoryLabel}
                        </span>

                        {validation.valid ? (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold" title="Tanda nominal sesuai">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-rose-400 font-bold" title={validation.message}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Invalid</span>
                          </span>
                        )}
                      </div>

                      {/* Judul Kartu */}
                      <h3 className="text-xs font-black text-white leading-snug truncate" title={card.title}>
                        {card.title}
                      </h3>

                      {/* Deskripsi Singkat */}
                      {card.description && (
                        <p className="text-[10px] text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {card.description}
                        </p>
                      )}
                    </div>

                    {/* Nominal Saldo */}
                    <div className="mt-2 pt-1.5 border-t border-stone-700/60 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-stone-400">Nominal:</span>
                      <span
                        className={`font-black ${
                          card.isChoice
                            ? 'text-amber-300 text-[11px]'
                            : card.amount > 0
                            ? 'text-emerald-400'
                            : card.amount < 0
                            ? 'text-rose-400'
                            : 'text-stone-300'
                        }`}
                      >
                        {card.isChoice
                          ? `IKUT ${formatRupiah(card.choiceExpense ?? -50_000)} | TOLAK Rp0`
                          : card.amount > 0
                          ? `+${formatRupiah(card.amount)}`
                          : formatRupiah(card.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Mode Debug Verifikasi Kartu</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-colors cursor-pointer"
          >
            Tutup Mode Debug
          </button>
        </div>
      </div>
    </div>
  );
};
