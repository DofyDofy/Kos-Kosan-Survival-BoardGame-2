import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import { formatRupiah, getFinancialStatus, getStatusStyle } from '../utils/format';
import { Wallet, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TurnTabProps {
  activePlayer: Player;
  isGameOver?: boolean;
}

export const TurnTab: React.FC<TurnTabProps> = ({
  activePlayer,
  isGameOver = false,
}) => {
  // State untuk deteksi selisih saldo sesaat pada pemain aktif
  const [balanceDelta, setBalanceDelta] = useState<number | null>(null);
  const [deltaKey, setDeltaKey] = useState<number>(0);
  const [isBalancePulsing, setIsBalancePulsing] = useState<boolean>(false);

  const lastPlayerIdRef = useRef<string>(activePlayer.id);
  const lastBalanceRef = useRef<number>(activePlayer.balance);
  const deltaTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Pantau perubahan saldo pemain aktif selama gilirannya
  useEffect(() => {
    // 1. Jika giliran berganti ke pemain lain:
    if (activePlayer.id !== lastPlayerIdRef.current) {
      lastPlayerIdRef.current = activePlayer.id;
      lastBalanceRef.current = activePlayer.balance;
      setBalanceDelta(null);
      if (deltaTimeoutRef.current) {
        clearTimeout(deltaTimeoutRef.current);
      }
      return;
    }

    // 2. Jika pemain sama tapi saldo berubah (biaya harian, kos, event card):
    if (activePlayer.balance !== lastBalanceRef.current) {
      const diff = activePlayer.balance - lastBalanceRef.current;
      lastBalanceRef.current = activePlayer.balance;

      if (diff !== 0) {
        setBalanceDelta(diff);
        setDeltaKey((k) => k + 1);
        setIsBalancePulsing(true);
        setTimeout(() => setIsBalancePulsing(false), 450);

        // Hapus lencana selisih setelah 1.8 detik
        if (deltaTimeoutRef.current) {
          clearTimeout(deltaTimeoutRef.current);
        }
        deltaTimeoutRef.current = setTimeout(() => {
          setBalanceDelta(null);
        }, 1800);
      }
    }
  }, [activePlayer.id, activePlayer.balance]);

  useEffect(() => {
    return () => {
      if (deltaTimeoutRef.current) {
        clearTimeout(deltaTimeoutRef.current);
      }
    };
  }, []);

  const financialStatus = getFinancialStatus(activePlayer.balance);
  const statusStyle = getStatusStyle(financialStatus);
  const isNegative = activePlayer.balance < 0;

  return (
    <div className="w-full max-w-[720px] mx-auto mb-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-3.5 md:p-4 shadow-lg border border-stone-200 dark:border-stone-800 transition-all select-none">
      {isGameOver ? (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Permainan Selesai</span>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Semua mahasiswa telah menyelesaikan putaran 30 hari di kos-kosan.
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {/* Baris Atas: Lencana Pemain, Nama, Status Keuangan & Progres Langkah */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Lencana Nomor & Warna Bidak */}
              <div
                style={{ backgroundColor: activePlayer.color }}
                className="w-6 h-6 md:w-7 md:h-7 rounded-full ring-2 ring-white dark:ring-stone-800 shadow-md flex items-center justify-center text-[11px] md:text-xs font-black text-white flex-shrink-0 animate-pulse"
                title={`Bidak #${activePlayer.markerNumber}`}
              >
                {activePlayer.markerNumber}
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5">
                  Giliran Pemain
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-base md:text-lg font-black text-stone-900 dark:text-white leading-tight truncate max-w-[140px] sm:max-w-[260px]"
                    title={activePlayer.name}
                  >
                    {activePlayer.name}
                  </span>
                  {/* Lencana Status Keuangan */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                    <span>{financialStatus}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Progres Langkah: Langkah X / 30 */}
            <div className="text-right flex-shrink-0">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5">
                Progres
              </div>
              <div className="text-xs font-extrabold text-amber-600 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 inline-flex items-center gap-1 shadow-xs">
                <span className="hidden sm:inline text-stone-500 dark:text-stone-400 font-semibold">Langkah</span>
                <strong>{activePlayer.tile} / 30</strong>
              </div>
            </div>
          </div>

          {/* Baris Bawah: Kotak Sisa Saldo Menonjol & Animasi Selisih */}
          <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-2.5 md:p-3 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400">
                <Wallet className="w-3.5 h-3.5 text-stone-400" />
                <span>Sisa Saldo</span>
              </div>

              {/* Nominal Saldo Besar & Tebal */}
              <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                <motion.span
                  animate={
                    isBalancePulsing
                      ? { scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] }
                      : { scale: 1, filter: 'brightness(1)' }
                  }
                  transition={{ duration: 0.35 }}
                  className={`text-2xl md:text-3xl font-black font-mono tracking-tight ${
                    isNegative
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-stone-900 dark:text-white'
                  }`}
                >
                  {formatRupiah(activePlayer.balance)}
                </motion.span>

                {/* Keterangan Utang jika saldo minus */}
                {isNegative && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500 text-white shadow-sm animate-bounce">
                    Utang
                  </span>
                )}
              </div>
            </div>

            {/* Animasi Selisih Saldo Sesaat (+Rp / -Rp memudar) */}
            <div className="h-7 flex items-center justify-end flex-shrink-0">
              <AnimatePresence mode="wait">
                {balanceDelta !== null && balanceDelta !== 0 && (
                  <motion.div
                    key={`delta-${deltaKey}`}
                    initial={{ opacity: 0, y: 8, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black font-mono shadow-md ${
                      balanceDelta > 0
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-300 dark:ring-emerald-800'
                        : 'bg-rose-500 text-white ring-2 ring-rose-300 dark:ring-rose-800'
                    }`}
                  >
                    <span>
                      {balanceDelta > 0 ? `+${formatRupiah(balanceDelta)}` : formatRupiah(balanceDelta)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Garis Progres Visual Tipis Menuju Petak 30 */}
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              style={{
                width: `${(activePlayer.tile / 30) * 100}%`,
                backgroundColor: activePlayer.color,
              }}
              className="h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};
