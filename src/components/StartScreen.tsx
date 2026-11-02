import React, { useState, useRef, useEffect } from 'react';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  MAX_NAME_LENGTH,
  INITIAL_PLAYERS,
  STARTING_MONEY,
  getDefaultPlayerName,
  normalizePlayerName,
} from '../constants';
import { formatRupiah } from '../utils/format';
import { Users, Play, Home, DollarSign, AlertCircle, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface StartScreenProps {
  initialCount?: number;
  initialNames?: string[];
  onStartGame: (playerCount: number, finalNames: string[], rawNames: string[]) => void;
  onOpenRules: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  initialCount = 2,
  initialNames,
  onStartGame,
  onOpenRules,
}) => {
  // Pilihan jumlah pemain (rentang valid 2 sampai 5)
  const [selectedCount, setSelectedCount] = useState<number>(() => {
    if (initialCount >= MIN_PLAYERS && initialCount <= MAX_PLAYERS) {
      return initialCount;
    }
    return 2;
  });

  // State nama tiap pemain (array ukuran MAX_PLAYERS)
  const [names, setNames] = useState<string[]>(() => {
    const list = Array.from({ length: MAX_PLAYERS }, (_, i) => '');
    if (initialNames && Array.isArray(initialNames)) {
      initialNames.slice(0, MAX_PLAYERS).forEach((val, i) => {
        if (typeof val === 'string') {
          list[i] = val.slice(0, MAX_NAME_LENGTH);
        }
      });
    }
    return list;
  });

  // Refs untuk navigasi Enter / Focus antar-kolom input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const availableOptions = Array.from(
    { length: MAX_PLAYERS - MIN_PLAYERS + 1 },
    (_, i) => MIN_PLAYERS + i
  );

  // Menghitung nama efektif untuk setiap pemain yang ikut serta
  const effectiveNames: string[] = Array.from({ length: selectedCount }, (_, i) => {
    const normalized = normalizePlayerName(names[i] || '');
    return normalized || getDefaultPlayerName(i);
  });

  // Validasi duplikat (Case-Insensitive)
  const lowerEffectiveNames = effectiveNames.map((name) => name.toLowerCase());
  const duplicateIndices = new Set<number>();

  for (let i = 0; i < selectedCount; i++) {
    for (let j = i + 1; j < selectedCount; j++) {
      if (lowerEffectiveNames[i] === lowerEffectiveNames[j]) {
        duplicateIndices.add(i);
        duplicateIndices.add(j);
      }
    }
  }

  const hasDuplicates = duplicateIndices.size > 0;
  const isReadyToStart = !hasDuplicates && selectedCount >= MIN_PLAYERS && selectedCount <= MAX_PLAYERS;

  // Handler perubahan teks pada input pemain
  const handleNameChange = (index: number, val: string) => {
    // Batas panjang 12 karakter dan rapikan spasi berturut-turut
    const trimmedToMax = val.slice(0, MAX_NAME_LENGTH);
    const cleanedSpacing = trimmedToMax.replace(/\s{2,}/g, ' ');

    setNames((prev) => {
      const next = [...prev];
      next[index] = cleanedSpacing;
      return next;
    });
  };

  // Handler blur untuk merapikan spasi di awal/akhir
  const handleNameBlur = (index: number) => {
    setNames((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = next[index].trim();
      }
      return next;
    });
  };

  // Handler submit permainan
  const handleSubmitGame = () => {
    if (!isReadyToStart) return;

    // Kumpulkan nama final yang dinormalisasi (atau default jika kosong)
    const finalNames = Array.from({ length: selectedCount }, (_, i) => {
      const norm = normalizePlayerName(names[i] || '');
      return norm || getDefaultPlayerName(i);
    });

    onStartGame(selectedCount, finalNames, names);
  };

  // Handler tombol keyboard (Tab / Enter)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index < selectedCount - 1) {
        // Pindah fokus ke kolom nama pemain berikutnya
        inputRefs.current[index + 1]?.focus();
      } else {
        // Kolom terakhir: langsung jalankan MULAI jika nama sudah valid
        if (isReadyToStart) {
          handleSubmitGame();
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-start sm:justify-center items-center p-3 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-y-auto">
      {/* Background Decor Elements */}
      <div className="fixed -top-32 -left-32 w-80 h-80 rounded-full bg-amber-400/10 dark:bg-amber-500/5 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Main Card (Scrollable & Responsive) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col items-center relative z-10 my-auto"
      >
        {/* Logo / Badge */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-amber-500/25 mb-2 sm:mb-3">
          🏠
        </div>

        {/* Judul Utama */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-center text-stone-900 dark:text-white uppercase leading-none">
          Kos-Kosan Survival
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 text-center mt-1.5 mb-5 sm:mb-6">
          Perjuangan bertahan hidup 30 hari anak kos dengan uang bulanan
        </p>

        {/* Kotak Pertanyaan Pemilihan Jumlah Pemain */}
        <div className="w-full bg-stone-50 dark:bg-stone-850/80 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white">
              Pilih Jumlah Pemain
            </h2>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
            Pemain akan bergantian melempar dadu di perangkat ini (2 sampai 5 pemain):
          </p>

          {/* Tombol Pilihan 2, 3, 4, 5 Pemain */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {availableOptions.map((count) => {
              const isSelected = selectedCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSelectedCount(count)}
                  className={`py-2.5 sm:py-3.5 px-2 rounded-2xl font-black text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none border-2 ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md scale-[1.02] ring-2 ring-amber-300 dark:ring-amber-400/50'
                      : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400/60 dark:hover:border-amber-500/60 hover:bg-amber-50/50 dark:hover:bg-stone-750'
                  }`}
                  aria-pressed={isSelected}
                  aria-label={`${count} Pemain`}
                >
                  <span className="text-xl sm:text-2xl font-black leading-none">
                    {count}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    Pemain
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* KOLOM ISIAN NAMA PEMAIN (Satu Baris Per Pemain)           */}
        {/* ======================================================== */}
        <div className="w-full bg-stone-50 dark:bg-stone-850/80 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 mb-4 sm:mb-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 dark:text-white">
                Nama Pemain (Opsional)
              </h3>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">
              Maks. {MAX_NAME_LENGTH} karakter
            </span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3.5">
            Ketik nama panggilan masing-masing. Kosongkan untuk memakai nama bawaan:
          </p>

          <div className="space-y-2.5">
            {Array.from({ length: selectedCount }).map((_, idx) => {
              const defaultName = getDefaultPlayerName(idx);
              const playerConfig = INITIAL_PLAYERS[idx];
              const isDuplicate = duplicateIndices.has(idx);
              const currentValue = names[idx] || '';

              return (
                <div key={`player-input-${idx}`} className="flex flex-col">
                  <div className="flex items-center gap-2.5">
                    {/* Lencana Warna & Nomor Bidak */}
                    <div
                      style={{ backgroundColor: playerConfig?.color || '#ef4444' }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0"
                      title={`Bidak #${idx + 1}`}
                    >
                      {idx + 1}
                    </div>

                    {/* Kolom Teks Input Nama */}
                    <div className="relative flex-1">
                      <input
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleNameChange(idx, e.target.value)}
                        onBlur={() => handleNameBlur(idx)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        placeholder={defaultName}
                        maxLength={MAX_NAME_LENGTH}
                        aria-label={`Nama Pemain ${idx + 1}`}
                        className={`w-full py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 border transition-all outline-none ${
                          isDuplicate
                            ? 'border-rose-500 ring-2 ring-rose-400/30 dark:ring-rose-500/20'
                            : 'border-stone-200 dark:border-stone-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30'
                        }`}
                      />
                      {currentValue.length > 0 && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-mono pointer-events-none">
                          {currentValue.length}/{MAX_NAME_LENGTH}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pesan Kesalahan Validasi Duplikat */}
                  {isDuplicate && (
                    <div className="pl-10.5 mt-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Nama tidak boleh sama</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pratinjau Pemain yang Akan Ikut (Live Update Mengikuti Ketikan) */}
        <div className="w-full mb-4 sm:mb-5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 px-1">
            <span>Pratinjau Pemain ({selectedCount} Orang):</span>
            <span className="text-emerald-500 dark:text-emerald-400 font-mono text-[11px]">
              {formatRupiah(STARTING_MONEY)} / org
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: selectedCount }).map((_, idx) => {
              const playerConfig = INITIAL_PLAYERS[idx];
              const displayName = effectiveNames[idx];

              return (
                <div
                  key={`preview-${idx}`}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-750 min-w-0"
                >
                  {/* Lencana Warna & Nomor */}
                  <div
                    style={{ backgroundColor: playerConfig?.color || '#ef4444' }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0"
                  >
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-xs font-extrabold text-stone-900 dark:text-white truncate"
                      title={displayName}
                    >
                      {displayName}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Bidak #{idx + 1} • Start Petak 1
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ringkasan Singkat Aturan */}
        <div className="w-full flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 py-2.5 px-3 bg-stone-100 dark:bg-stone-800/40 rounded-xl mb-4 sm:mb-5 border border-stone-200/60 dark:border-stone-750">
          <div className="flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-amber-500" />
            <span>Kos: Rp450.000</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-rose-400" />
            <span>Harian: Rp20.000</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-emerald-500">
            <span>Finish: Petak 30</span>
          </div>
        </div>

        {/* Tombol Aksi: MULAI PERMAINAN */}
        <button
          type="button"
          onClick={handleSubmitGame}
          disabled={!isReadyToStart}
          className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-5 h-5 fill-current flex-shrink-0" />
          <span>MULAI ({selectedCount} PEMAIN)</span>
        </button>

        {/* Informasi jika tombol terkunci karena nama sama */}
        {hasDuplicates && (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-semibold text-center mt-2 flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Perbaiki nama yang sama terlebih dahulu untuk memulai permainan.</span>
          </p>
        )}
      </motion.div>
    </div>
  );
};
