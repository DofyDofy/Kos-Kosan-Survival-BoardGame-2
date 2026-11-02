import React, { useState, useEffect, useRef } from 'react';
import { Player } from '../types';
import { sounds } from '../utils/audio';
import { Dices, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DiceRollerProps {
  activePlayer: Player;
  onRoll: (value: number) => void;
  disabled: boolean;
  lastRoll: number | null;
  isGameOver?: boolean;
}

// Koordinat titik dadu standar 1-6 (dalam %)
const DICE_DOTS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export const DiceRoller: React.FC<DiceRollerProps> = ({
  activePlayer,
  onRoll,
  disabled,
  lastRoll,
  isGameOver = false,
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [displayRoll, setDisplayRoll] = useState<number>(1);
  const [currentRollValue, setCurrentRollValue] = useState<number | null>(null);

  const lastPlayerIdRef = useRef<string>(activePlayer.id);

  // Aturan 2: Pada awal giliran berikutnya, dadu kembali ke keadaan netral sebelum dilempar lagi.
  // Hasil lemparan tetap terlihat sampai pemain berikutnya mendapat giliran.
  useEffect(() => {
    if (activePlayer.id !== lastPlayerIdRef.current) {
      lastPlayerIdRef.current = activePlayer.id;
      setCurrentRollValue(null);
      setDisplayRoll(1);
    }
  }, [activePlayer.id]);

  const handleRollClick = () => {
    if (disabled || isRolling || isGameOver || activePlayer.isFinished) return;

    setIsRolling(true);
    sounds.playDiceRoll();

    // Acak angka dadu selama ~900ms
    const finalValue = Math.floor(Math.random() * 6) + 1;
    let iterations = 0;
    const interval = setInterval(() => {
      setDisplayRoll(Math.floor(Math.random() * 6) + 1);
      iterations++;
      if (iterations >= 12) {
        clearInterval(interval);
        setDisplayRoll(finalValue);
        setCurrentRollValue(finalValue);
        setIsRolling(false);
        // Bidak baru mulai bergerak setelah dadu selesai berhenti
        onRoll(finalValue);
      }
    }, 75);
  };

  const dots = DICE_DOTS[displayRoll] || DICE_DOTS[1];
  const isButtonDisabled = disabled || isRolling || isGameOver || activePlayer.isFinished;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 md:bottom-5 md:right-8 z-40 flex items-center justify-center pointer-events-none">
      {/* Wadah Tunggal Sticky / Floating Gabungan (Dadu + Tombol Berdampingan) */}
      <div className="pointer-events-auto bg-stone-900/95 dark:bg-stone-950/95 text-white backdrop-blur-lg rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-stone-700/80 dark:border-stone-800 flex items-center gap-2 sm:gap-3 w-full sm:w-auto transition-all select-none ring-1 ring-white/10">
        
        {/* ======================================================== */}
        {/* TAMPILAN DADU BERDAMPINGAN DENGAN TOMBOL                 */}
        {/* ======================================================== */}
        <div
          onClick={isButtonDisabled ? undefined : handleRollClick}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-xl border transition-all flex-shrink-0 ${
            isButtonDisabled
              ? 'bg-stone-800/60 border-stone-700/40 opacity-70 cursor-not-allowed'
              : 'bg-stone-800/90 border-stone-600/60 hover:bg-stone-750 cursor-pointer'
          }`}
          title={isButtonDisabled ? undefined : `Klik untuk melempar dadu (${activePlayer.name})`}
        >
          {/* Visual Dadu Kubus Berputar */}
          <motion.div
            animate={
              isRolling
                ? {
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.18, 0.92, 1.12, 1],
                    x: [-3, 3, -2, 2, 0],
                    y: [-2, 2, -3, 1, 0],
                  }
                : { rotate: 0, scale: 1, x: 0, y: 0 }
            }
            transition={{ duration: 0.85, ease: 'easeInOut' }}
            className="relative w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-white via-stone-100 to-stone-200 text-stone-900 rounded-xl shadow-md border border-stone-300 p-1 flex items-center justify-center flex-shrink-0"
          >
            {dots.map(([cx, cy], i) => (
              <div
                key={i}
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-stone-900 shadow-inner"
              />
            ))}
            {/* Kilau sudut dadu */}
            <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white/90 rounded-full blur-[0.5px]" />
          </motion.div>

          {/* Teks Hasil Dadu Sesuai Permintaan (contoh: "Dadu: 4") */}
          <div className="flex flex-col pr-1 min-w-[56px] sm:min-w-[62px]">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5">
              {isRolling ? 'Kocok' : currentRollValue !== null ? 'Hasil' : 'Dadu'}
            </span>
            <span className="text-xs sm:text-sm font-black font-mono leading-tight tracking-tight">
              {isRolling ? (
                <span className="text-amber-400">Dadu: ?</span>
              ) : currentRollValue !== null ? (
                <span className="text-amber-400">Dadu: {currentRollValue}</span>
              ) : (
                <span className="text-stone-300">Siap</span>
              )}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TOMBOL ROLL DICE                                         */}
        {/* ======================================================== */}
        <button
          onClick={handleRollClick}
          disabled={isButtonDisabled}
          style={{
            backgroundColor: isButtonDisabled ? undefined : activePlayer.color,
          }}
          className={`flex-1 sm:flex-initial min-w-[140px] sm:min-w-[200px] md:min-w-[220px] h-12 sm:h-13 px-4 sm:px-5 rounded-xl font-black text-xs sm:text-sm md:text-base tracking-wide uppercase transition-all flex items-center justify-center gap-2 shadow-lg ring-1 ring-white/20 ${
            isButtonDisabled
              ? 'bg-stone-800 text-stone-500 cursor-not-allowed opacity-50 shadow-none ring-0'
              : 'text-white hover:brightness-110 active:scale-[0.97] cursor-pointer hover:shadow-xl'
          }`}
        >
          {isRolling ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
              >
                <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.span>
              <span>Mengocok...</span>
            </>
          ) : isGameOver ? (
            <>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span>Selesai</span>
            </>
          ) : activePlayer.isFinished ? (
            <>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span className="truncate">{activePlayer.name} Selesai</span>
            </>
          ) : disabled ? (
            <>
              <Sparkles className="w-4 h-4 opacity-75" />
              <span>Bergerak...</span>
            </>
          ) : (
            <>
              <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">ROLL DICE ({activePlayer.name})</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
};
