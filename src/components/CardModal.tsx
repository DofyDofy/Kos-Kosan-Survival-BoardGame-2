import React, { useEffect, useState } from 'react';
import { CardDef, Player } from '../types';
import { formatRupiah } from '../utils/format';
import { sounds } from '../utils/audio';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, X, Sparkles, AlertCircle } from 'lucide-react';

interface CardModalProps {
  card: CardDef;
  player: Player;
  onContinue: (finalAmount: number, logMessage: string) => void;
}

export const CardModal: React.FC<CardModalProps> = ({
  card,
  player,
  onContinue,
}) => {
  // Animasi stages:
  // 1: shuffle (kartu_belakang.png goyang/shuffle)
  // 2: flip (berputar 180 derajat membuka ke depan)
  // 3: revealed (kartu terbuka, ringkasan dan tombol muncul)
  const [stage, setStage] = useState<'shuffle' | 'flipping' | 'revealed'>('shuffle');
  const [selectedChoice, setSelectedChoice] = useState<'IKUT' | 'TOLAK' | null>(null);

  // Jalankan animasi urutan saat modal pertama kali terbuka
  useEffect(() => {
    // 1.5 detik shuffle
    const shuffleTimer = setTimeout(() => {
      setStage('flipping');
      sounds.playCardFlip();

      // 0.6 detik flip selesai
      const flipTimer = setTimeout(() => {
        setStage('revealed');
        if (card.category === 'REZEKI' || card.amount > 0) {
          sounds.playCashGain();
        } else if (card.category === 'PENGELUARAN' || card.amount < 0) {
          sounds.playExpense();
        }
      }, 500);

      return () => clearTimeout(flipTimer);
    }, 1400);

    return () => clearTimeout(shuffleTimer);
  }, [card]);

  // Nominal final yang akan dieksekusi
  const finalAmount = card.isChoice
    ? selectedChoice === 'IKUT'
      ? (card.choiceExpense ?? -50_000)
      : 0
    : card.amount;

  const canProceed = !card.isChoice || selectedChoice !== null;

  const handleContinueClick = () => {
    if (!canProceed) return;

    let logMessage = '';
    if (card.isChoice) {
      if (selectedChoice === 'IKUT') {
        logMessage = `${player.name} memutuskan IKUT nongkrong dan keluar uang ${formatRupiah(Math.abs(finalAmount))}.`;
      } else {
        logMessage = `${player.name} berhemat dan MENOLAK ajakan nongkrong (Rp0).`;
      }
    } else {
      if (finalAmount > 0) {
        logMessage = `${player.name} mendapat rezeki ${card.title}: +${formatRupiah(finalAmount)}.`;
      } else {
        logMessage = `${player.name} terkena pengeluaran ${card.title}: ${formatRupiah(finalAmount)}.`;
      }
    }

    onContinue(finalAmount, logMessage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm md:max-w-md bg-stone-900 rounded-3xl p-6 shadow-2xl border border-stone-700 flex flex-col items-center">
        {/* Header Kategori Event */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
          <div className="flex items-center gap-2">
            <span
              style={{ backgroundColor: player.color }}
              className="w-3 h-3 rounded-full"
            />
            <span className="text-xs font-semibold text-stone-300">
              Kartu Event untuk <strong>{player.name}</strong>
            </span>
          </div>

          <span
            className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
              card.category === 'REZEKI'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : card.category === 'PENGELUARAN'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
            }`}
          >
            {card.categoryLabel || card.category}
          </span>
        </div>

        {/* Area Kartu dengan Animasi 3D Flip & Shuffle */}
        <div className="relative w-56 h-80 md:w-64 md:h-92 my-2 perspective-1000 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {stage === 'shuffle' && (
              <motion.div
                key="back"
                animate={{
                  x: [-12, 12, -8, 8, -4, 4, 0],
                  y: [-4, 4, -2, 2, 0],
                  rotate: [-3, 3, -2, 2, 0],
                }}
                transition={{ duration: 1.3, ease: 'easeInOut' }}
                className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-stone-600 bg-stone-800 flex flex-col items-center justify-center text-center p-4"
              >
                {/* Mencoba menampilkan kartu_belakang.png jika tersedia */}
                <img
                  src="/kartu_belakang.png"
                  alt="Sisi Belakang Kartu"
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    // Placeholder polos berlabel nama file jika kartu_belakang.png belum ada
                    (e.target as HTMLElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      const placeholder = document.getElementById('back-card-placeholder');
                      if (placeholder) placeholder.style.display = 'flex';
                    }
                  }}
                />
                <div
                  id="back-card-placeholder"
                  className="hidden w-full h-full rounded-xl border border-dashed border-stone-500 flex-col items-center justify-center p-4 bg-stone-800/80"
                >
                  <Sparkles className="w-10 h-10 text-amber-400 mb-2 animate-pulse" />
                  <div className="text-xs font-mono font-bold text-amber-300 mb-1">
                    kartu_belakang.png
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Sisi Belakang Kartu
                  </div>
                  <div className="text-[10px] text-stone-500 mt-3">
                    Mengocok kartu event...
                  </div>
                </div>
              </motion.div>
            )}

            {(stage === 'flipping' || stage === 'revealed') && (
              <motion.div
                key="front"
                initial={{ rotateY: 90, scale: 0.9 }}
                animate={{ rotateY: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50 bg-stone-900 flex items-center justify-center"
              >
                {/* Menampilkan gambar kartu_XX.png asli buatan pengguna apa adanya */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-contain rounded-xl select-none"
                  onError={(e) => {
                    // Fallback path ke asset upload studio
                    (e.target as HTMLImageElement).src = `/assets/aistudio/${card.image.replace('/', '')}`;
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bagian Bawah: Ringkasan Perubahan Saldo & Tombol Aksi */}
        {stage === 'revealed' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full mt-3 flex flex-col items-center gap-3"
          >
            {/* Opsi Pilihan Khusus untuk Kartu 14: Diajak Nongkrong */}
            {card.isChoice && (
              <div className="w-full flex flex-col items-center gap-2 p-3 bg-stone-800/90 rounded-xl border border-stone-700">
                <span className="text-xs font-medium text-stone-300">
                  Pilih keputusan nongkrong kamu:
                </span>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    onClick={() => setSelectedChoice('IKUT')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedChoice === 'IKUT'
                        ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                        : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Ikut ({formatRupiah(card.choiceExpense ?? -50_000)})</span>
                  </button>

                  <button
                    onClick={() => setSelectedChoice('TOLAK')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      selectedChoice === 'TOLAK'
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                        : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Tolak (Rp0)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Ringkasan Saldo di bawah kartu */}
            <div className="text-center">
              <div className="text-xs text-stone-400">Ringkasan Perubahan:</div>
              <div
                className={`text-base font-extrabold flex items-center justify-center gap-1 ${
                  finalAmount > 0
                    ? 'text-emerald-400'
                    : finalAmount < 0
                    ? 'text-rose-400'
                    : 'text-stone-300'
                }`}
              >
                <span>
                  {finalAmount > 0
                    ? `+${formatRupiah(finalAmount)} bertambah ke saldo`
                    : finalAmount < 0
                    ? `${formatRupiah(finalAmount)} dipotong dari saldo`
                    : 'Saldo tidak berubah (Rp0)'}
                </span>
              </div>
            </div>

            {/* Tombol Lanjutkan */}
            <button
              onClick={handleContinueClick}
              disabled={!canProceed}
              className={`w-full py-3 px-6 rounded-xl font-black text-sm tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                canProceed
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 active:scale-[0.98]'
                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
