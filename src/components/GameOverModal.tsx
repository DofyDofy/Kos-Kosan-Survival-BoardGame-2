import React, { useEffect } from 'react';
import { Player } from '../types';
import { formatRupiah, getFinancialStatus, getStatusStyle } from '../utils/format';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface GameOverModalProps {
  players: Player[];
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  players,
  onRestart,
}) => {
  const sortedPlayers = [...players].sort((a, b) => b.balance - a.balance);
  const winner = sortedPlayers[0];

  useEffect(() => {
    sounds.playVictory();

    // Efek kembang api konfeti
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-lg bg-stone-900 text-stone-100 rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-500/50 flex flex-col items-center max-h-[92vh] overflow-y-auto"
      >
        {/* Ikon Mahkota & Pemenang */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-10 h-10 text-stone-950" />
          </div>
          <Crown className="absolute -top-3 w-8 h-8 text-yellow-300 animate-bounce" />
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-center text-white tracking-wide uppercase">
          30 Hari Terlewati!
        </h1>
        <p className="text-xs text-amber-300 text-center mt-1 mb-4">
          Semua anak kos telah menyelesaikan satu putaran perjuangan bertahan hidup
        </p>

        {/* Kotak Pemenang Utama */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 text-center mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Juara Anak Kos Paling Hemat
          </span>
          <div className="text-2xl font-black text-white mt-1 flex items-center justify-center gap-2">
            <span
              style={{ backgroundColor: winner.color }}
              className="w-4 h-4 rounded-full"
            />
            <span className="truncate max-w-[220px] sm:max-w-[320px]" title={winner.name}>
              {winner.name}
            </span>
          </div>
          <div className="text-lg font-mono font-extrabold text-amber-400 mt-1">
            Sisa Saldo: {formatRupiah(winner.balance)}
          </div>
          <div className="text-xs text-stone-300 mt-1">
            Status:{' '}
            <strong className="text-emerald-400">
              {getFinancialStatus(winner.balance)}
            </strong>
          </div>
        </div>

        {/* Tabel Lengkap Peringkat Akhir */}
        <div className="w-full space-y-2 mb-6">
          <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-1">
            Peringkat Akhir Keuangan:
          </div>

          <div className="divide-y divide-stone-800 bg-stone-950/60 rounded-xl border border-stone-800 overflow-hidden">
            {sortedPlayers.map((player, idx) => {
              const status = getFinancialStatus(player.balance);
              const style = getStatusStyle(status);

              return (
                <div
                  key={player.id}
                  className="p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 text-center font-bold text-stone-400 flex-shrink-0">
                      #{idx + 1}
                    </span>
                    <div
                      style={{ backgroundColor: player.color }}
                      className="w-3 h-3 rounded-full flex-shrink-0"
                    />
                    <span
                      className="font-bold text-stone-200 truncate max-w-[120px] sm:max-w-[200px]"
                      title={player.name}
                    >
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-stone-200">
                      {formatRupiah(player.balance)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badge}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tombol Main Lagi */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>MAIN LAGI</span>
        </button>
      </motion.div>
    </div>
  );
};
