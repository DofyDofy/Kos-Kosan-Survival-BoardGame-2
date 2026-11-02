/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  STARTING_MONEY,
  DAILY_EXPENSE,
  KOS_BILL,
  TOTAL_TILES,
  TILE_TYPES,
  TILE_COORDS as INITIAL_TILE_COORDS,
  CARDS,
  INITIAL_PLAYERS,
  EVENT_PROBABILITIES,
  getDefaultPlayerName,
} from './constants';
import { CardDef, GameLog, Player, TileCoord } from './types';
import { formatRupiah } from './utils/format';
import { sounds } from './utils/audio';

import { GameBoard } from './components/GameBoard';
import { TurnTab } from './components/TurnTab';
import { DiceRoller } from './components/DiceRoller';
import { Leaderboard } from './components/Leaderboard';
import { ActivityLog } from './components/ActivityLog';
import { CardModal } from './components/CardModal';
import { CalibrationModal } from './components/CalibrationModal';
import { AssetStatusModal } from './components/AssetStatusModal';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { StartScreen } from './components/StartScreen';
import { DebugCardsModal } from './components/DebugCardsModal';

import {
  Crosshair,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  BookOpen,
  AlertTriangle,
  Bug,
} from 'lucide-react';

export default function App() {
  const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const isAdminRoute = normalizedPath === '/admin';

  // ==========================================
  // STATE TERPUSAT (Centralized State)
  // ==========================================
  // Layar Awal (Start Screen) untuk pemilihan jumlah pemain
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number>(2);
  const [savedPlayerNames, setSavedPlayerNames] = useState<string[]>(() => [
    '', '', '', '', ''
  ]);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState<boolean>(false);

  // Daftar pemain yang sedang aktif bermain (sesuai jumlah yang dipilih: 2-5 pemain)
  const [players, setPlayers] = useState<Player[]>(() =>
    INITIAL_PLAYERS.slice(0, 2).map((p) => ({ ...p }))
  );
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [tileCoords, setTileCoords] = useState<TileCoord[]>(INITIAL_TILE_COORDS);
  const [logs, setLogs] = useState<GameLog[]>([]);

  // Status Pergerakan & Dadu
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [movingPlayerId, setMovingPlayerId] = useState<string | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  // Status Kartu Event & Validasi
  const [activeCard, setActiveCard] = useState<CardDef | null>(null);
  const [cardPlayer, setCardPlayer] = useState<Player | null>(null);
  const [activeCardTileType, setActiveCardTileType] = useState<string>('Petak Event');

  // Status Modal & Fitur Pendukung
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationTargetTile, setCalibrationTargetTile] = useState<number>(1);
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState<boolean>(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isCardsDebugOpen, setIsCardsDebugOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Shortcut debug hanya aktif di URL /admin.
  useEffect(() => {
    if (!isAdminRoute) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        const tagName = document.activeElement?.tagName?.toUpperCase();
        if (tagName === 'INPUT' || tagName === 'TEXTAREA') return;
        setIsCardsDebugOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminRoute]);

  const activePlayer = players[activePlayerIndex] || players[0];


  // Helper tambah catatan riwayat (Log)
  const addLog = (
    type: GameLog['type'],
    message: string,
    player: Player,
    amount?: number
  ) => {
    const newLog: GameLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      playerId: player.id,
      playerName: player.name,
      type,
      message,
      amount,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Toggle Mute Audio
  const toggleSound = () => {
    sounds.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  // ==========================================
  // LOGIKA LEMPAR DADU & PERGERAKAN BIDAK
  // ==========================================
  const handleRollDice = async (diceValue: number) => {
    if (isMoving || activeCard || isGameOver || activePlayer.isFinished) return;

    setLastRoll(diceValue);
    setIsMoving(true);
    setMovingPlayerId(activePlayer.id);

    const startTile = activePlayer.tile;
    // Jarak ke garis finish (Petak 30)
    const remainingSteps = TOTAL_TILES - startTile;
    // Aturan 3: Langkah yang melewati petak 30 tidak dihitung
    const actualSteps = Math.min(diceValue, remainingSteps);

    if (actualSteps < diceValue) {
      addLog(
        'move',
        `melempar dadu ${diceValue}, namun hanya membutuhkan ${actualSteps} langkah untuk mencapai garis finish (Petak 30).`,
        activePlayer
      );
    } else {
      addLog(
        'move',
        `melempar dadu dan mendapat angka ${diceValue}. Melangkah ${actualSteps} petak.`,
        activePlayer
      );
    }

    let runningTile = startTile;
    let currentBalance = activePlayer.balance;
    let hasPaidKos: boolean = activePlayer.hasPaidKos;
    let isFinished: boolean = activePlayer.isFinished;

    // Gerakkan bidak petak demi petak hanya sebanyak actualSteps (animasi berhenti tepat di petak 30)
    for (let step = 1; step <= actualSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 360));

      runningTile += 1;

      // Biaya harian Rp20.000 per petak yang dilalui (Aturan 3)
      currentBalance -= DAILY_EXPENSE;
      sounds.playPawnStep();

      // Cek apakah MELEWATI atau MENDARAT di Petak 5 (Tagihan Kos Rp450.000)
      if (runningTile === 5 && !hasPaidKos) {
        hasPaidKos = true;
        currentBalance -= KOS_BILL;
        sounds.playKosAlert();
        addLog(
          'kos',
          `⚠️ Tagihan Kos Jatuh Tempo! Membayar sewa kamar Rp450.000 di Petak 5.`,
          activePlayer,
          -KOS_BILL
        );
      }

      // Jika mencapai petak 30, tandai SELESAI dan hentikan (Aturan 1 & 2)
      if (runningTile >= TOTAL_TILES) {
        runningTile = TOTAL_TILES;
        isFinished = true;
      }

      // Perbarui posisi sementara bidak pada papan secara langsung
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                tile: runningTile,
                balance: currentBalance,
                hasPaidKos,
                isFinished,
                lapCompleted: isFinished,
                totalPengeluaran:
                  p.totalPengeluaran +
                  DAILY_EXPENSE +
                  (runningTile === 5 && hasPaidKos ? KOS_BILL : 0),
              }
            : p
        )
      );
    }

    if (actualSteps > 0) {
      addLog(
        'daily',
        `Membayar total biaya hidup harian ${formatRupiah(actualSteps * DAILY_EXPENSE)} (${actualSteps} hari).`,
        activePlayer,
        -(actualSteps * DAILY_EXPENSE)
      );
    }

    if (isFinished) {
      addLog(
        'finish',
        `🏁 ${activePlayer.name} telah mencapai garis finish di Petak 30! Berstatus SELESAI.`,
        activePlayer
      );
    }

    setIsMoving(false);
    setMovingPlayerId(null);

    // ==========================================
    // PENGECEKAN PETAK PENDARATAN
    // ==========================================
    const landedTileDef = TILE_TYPES.find((t) => t.tile === runningTile);
    const tileType = landedTileDef?.type || 'HARIAN';

    const updatedPlayer: Player = {
      ...activePlayer,
      tile: runningTile,
      balance: currentBalance,
      hasPaidKos,
      isFinished,
      lapCompleted: isFinished,
    };

    // Aturan 4: Jika bidak mendarat TEPAT di petak 30 dan petak itu punya efek, jalankan efeknya satu kali.
    // Jika bidak melewati petak 30 karena dadu lebih besar dari sisa langkah, tidak ada efek tambahan di luar petak 30.
    const isExceededLandingOn30 = runningTile === TOTAL_TILES && diceValue > remainingSteps;

    if (isExceededLandingOn30) {
      // Melewati petak 30: tidak ada efek tambahan, langsung pindah giliran
      advanceTurn(updatedPlayer);
      return;
    }

    // Jika mendarat di petak event khusus:
    if (tileType === 'REZEKI') {
      // Petak Rezeki: hanya boleh menarik kartu berkategori Rezeki (kartu_07 sampai kartu_11)
      const rezekiCards = CARDS.filter((c) => c.category === 'REZEKI');
      const chosenCard = rezekiCards[Math.floor(Math.random() * rezekiCards.length)];
      triggerCardEvent(chosenCard, updatedPlayer, 'Petak Rezeki');
    } else if (tileType === 'PENGELUARAN_TAK_TERDUGA') {
      // Petak Pengeluaran Tak Terduga (petak 21-30): hanya boleh menarik kartu berkategori Pengeluaran
      // dengan nominal Rp50.000 sampai Rp100.000 (kartu_01, kartu_02, kartu_03, kartu_06).
      // Kartu -30.000 dan -40.000 TIDAK BOLEH muncul di sini.
      const emergencyCards = CARDS.filter(
        (c) => c.category === 'PENGELUARAN' && Math.abs(c.amount) >= 50_000
      );
      const chosenCard = emergencyCards[Math.floor(Math.random() * emergencyCards.length)];
      triggerCardEvent(chosenCard, updatedPlayer, 'Petak Pengeluaran Tak Terduga');
    } else if (tileType === 'EVENT_UMUM') {
      // Petak Event Umum: 40% Rezeki, 45% Pengeluaran, 15% Kejadian Unik,
      // lalu pilih acak dari kategori itu (di sini kartu -30.000 dan -40.000 boleh muncul)
      const rand = Math.random();
      let pickedCategory: 'REZEKI' | 'PENGELUARAN' | 'UNIK';
      if (rand < EVENT_PROBABILITIES.REZEKI) {
        pickedCategory = 'REZEKI';
      } else if (rand < EVENT_PROBABILITIES.REZEKI + EVENT_PROBABILITIES.PENGELUARAN) {
        pickedCategory = 'PENGELUARAN';
      } else {
        pickedCategory = 'UNIK';
      }

      const availableCards = CARDS.filter((c) => c.category === pickedCategory);
      const chosenCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      triggerCardEvent(chosenCard, updatedPlayer, 'Petak Event Umum');
    } else {
      advanceTurn(updatedPlayer);
    }
  };

  // Validasi tanda nominal: kartu Rezeki harus bernilai positif (+), kartu Pengeluaran harus bernilai negatif (-)
  const validateCardSign = (card: CardDef): boolean => {
    if (card.category === 'REZEKI' && card.amount <= 0) {
      console.warn(
        `[VALIDASI TANDA NOMINAL GAGAL] Kartu Rezeki "${card.title}" (${card.file}) bernilai non-positif (${card.amount}). Efek saldo dibatalkan!`
      );
      return false;
    }
    if (card.category === 'PENGELUARAN' && card.amount >= 0) {
      console.warn(
        `[VALIDASI TANDA NOMINAL GAGAL] Kartu Pengeluaran "${card.title}" (${card.file}) bernilai non-negatif (${card.amount}). Efek saldo dibatalkan!`
      );
      return false;
    }
    return true;
  };

  // Memicu modal kartu event (Single Source of Truth: SATU objek kartu disimpan dan digunakan di seluruh alur)
  const triggerCardEvent = (card: CardDef, player: Player, tileTypeName: string) => {
    setActiveCard(card);
    setCardPlayer(player);
    setActiveCardTileType(tileTypeName);

    validateCardSign(card);

    console.log('[KARTU EVENT DIBUKA]', {
      jenisPetak: tileTypeName,
      file: card.file,
      judul: card.title,
      kategori: card.categoryLabel,
      nominal: card.isChoice
        ? `Pilihan: IKUT (${formatRupiah(card.choiceExpense ?? -50_000)}) atau TOLAK (Rp0)`
        : card.amount,
      saldoSebelum: player.balance,
      saldoSesudah: card.isChoice
        ? `${formatRupiah(player.balance + (card.choiceExpense ?? -50_000))} (jika Ikut) / ${formatRupiah(player.balance)} (jika Tolak)`
        : formatRupiah(player.balance + card.amount),
    });
  };

  // Lanjutan setelah pemain menekan LANJUTKAN pada Modal Kartu
  const handleCardContinue = (finalAmount: number, logMessage: string) => {
    if (!cardPlayer || !activeCard) return;

    // Validasi tanda nominal sebelum saldo diterapkan
    let appliedAmount = finalAmount;
    if (!validateCardSign(activeCard) && !activeCard.isChoice) {
      console.warn(
        `[VALIDASI TANDA GAGAL] Efek saldo untuk ${activeCard.file} dibatalkan karena tanda tidak cocok dengan kategori!`
      );
      appliedAmount = 0;
    }

    const newBalance = cardPlayer.balance + appliedAmount;
    const isGain = appliedAmount > 0;

    // Log console: jenis petak yang diinjak, file kartu, judul, kategori, nominal, dan saldo pemain sebelum & sesudah efek
    console.log('[KARTU EVENT SELESAI DIEKSEKUSI]', {
      jenisPetak: activeCardTileType,
      file: activeCard.file,
      judul: activeCard.title,
      kategori: activeCard.categoryLabel,
      nominal: appliedAmount,
      saldoSebelum: cardPlayer.balance,
      saldoSesudah: newBalance,
    });

    const updatedPlayer: Player = {
      ...cardPlayer,
      balance: newBalance,
      totalRezeki: cardPlayer.totalRezeki + (isGain ? appliedAmount : 0),
      totalPengeluaran: cardPlayer.totalPengeluaran + (!isGain ? Math.abs(appliedAmount) : 0),
    };

    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activePlayerIndex ? updatedPlayer : p))
    );

    addLog('card', logMessage, updatedPlayer, appliedAmount);

    setActiveCard(null);
    setCardPlayer(null);

    // Lanjutkan giliran ke pemain berikutnya
    advanceTurn(updatedPlayer);
  };

  // Pindah giliran ke pemain berikutnya (Aturan 5, 7, 8)
  const advanceTurn = (justPlayedPlayer: Player) => {
    // 1. Simpan pemain yang baru saja bermain ke daftar
    const updatedPlayers = players.map((p, idx) =>
      idx === activePlayerIndex ? justPlayedPlayer : p
    );
    setPlayers(updatedPlayers);

    // 2. Aturan 7: Periksa apakah SEMUA pemain sudah berstatus SELESAI
    const allFinished = updatedPlayers.every((p) => p.isFinished);

    if (allFinished) {
      setIsGameOver(true);
      addLog(
        'finish',
        '🎉 Permainan Berakhir! Semua mahasiswa telah mencapai garis finish di Petak 30.',
        justPlayedPlayer
      );
      return;
    }

    // 3. Aturan 5 & 8: Cari pemain berikutnya yang BELUM selesai
    // Rotasi giliran: lewati pemain yang sudah SELESAI
    // Pastikan tidak macet saat tinggal sisa 1 pemain yang belum selesai
    let nextIdx = (activePlayerIndex + 1) % updatedPlayers.length;
    let checkedCount = 0;

    while (updatedPlayers[nextIdx].isFinished && checkedCount < updatedPlayers.length) {
      nextIdx = (nextIdx + 1) % updatedPlayers.length;
      checkedCount++;
    }

    setActivePlayerIndex(nextIdx);
  };

  // Mulai permainan baru dari Layar Awal (Start Screen)
  const handleStartGame = (count: number, finalNames: string[], rawNames: string[]) => {
    setSelectedPlayerCount(count);
    setSavedPlayerNames(rawNames);

    const newPlayers = INITIAL_PLAYERS.slice(0, count).map((p, idx) => ({
      ...p,
      name: finalNames[idx] || getDefaultPlayerName(idx),
      isTurn: idx === 0,
      tile: 1,
      balance: STARTING_MONEY,
      hasPaidKos: false,
      lapCompleted: false,
      isFinished: false,
      totalRezeki: 0,
      totalPengeluaran: 0,
    }));
    setPlayers(newPlayers);
    setActivePlayerIndex(0);
    setLogs([
      {
        id: `${Date.now()}-init`,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        playerId: newPlayers[0].id,
        playerName: newPlayers[0].name,
        type: 'system',
        message: `Permainan dimulai dengan ${count} pemain (${newPlayers.map((p) => p.name).join(', ')})! Setiap pemain dibekali uang saku Rp1.200.000.`,
      },
    ]);
    setLastRoll(null);
    setIsMoving(false);
    setMovingPlayerId(null);
    setActiveCard(null);
    setCardPlayer(null);
    setIsGameOver(false);
    setIsGameStarted(true);
    // Buka Buku Saku otomatis satu kali SETELAH tombol MULAI ditekan (bukan di layar awal)
    setIsRulesModalOpen(true);
  };

  // Mulai ulang permainan (Kembali ke Layar Awal dengan jumlah & nama pemain sebelumnya tetap terisi)
  const handleRestartGame = () => {
    setIsRestartConfirmOpen(false);
    setIsGameStarted(false);
    setIsGameOver(false);
    setActivePlayerIndex(0);
    setLogs([]);
    setLastRoll(null);
    setIsMoving(false);
    setMovingPlayerId(null);
    setActiveCard(null);
    setCardPlayer(null);
    setPlayers((prev) =>
      prev.map((p, idx) => ({
        ...p,
        tile: 1,
        balance: STARTING_MONEY,
        hasPaidKos: false,
        lapCompleted: false,
        isFinished: false,
        totalRezeki: 0,
        totalPengeluaran: 0,
        isTurn: idx === 0,
      }))
    );
  };

  // ==========================================
  // KALIBRASI KOORDINAT
  // ==========================================
  const handleTileCalibrated = (tileNum: number, x: number, y: number) => {
    setTileCoords((prev) =>
      prev.map((c) => (c.tile === tileNum ? { ...c, x, y } : c))
    );

    // Otomatis maju ke petak berikutnya agar kalibrasi 1-30 cepat selesai
    if (tileNum < TOTAL_TILES) {
      setCalibrationTargetTile(tileNum + 1);
    } else {
      // Sudah sampai petak 30, buka modal kalibrasi untuk melihat JSON
      setIsCalibrationModalOpen(true);
    }
  };

  const handleApplyCoords = (newCoords: TileCoord[]) => {
    setTileCoords(newCoords);
    setIsCalibrationModalOpen(false);
  };

  const handleResetCoords = () => {
    setTileCoords(INITIAL_TILE_COORDS);
  };

  // 1. Tampilkan Layar Awal jika permainan belum dimulai
  if (!isGameStarted) {
    return (
      <>
        <StartScreen
          initialCount={selectedPlayerCount}
          initialNames={savedPlayerNames}
          onStartGame={handleStartGame}
          onOpenRules={() => setIsRulesModalOpen(true)}
        />
        {isAdminRoute && (
          <div className="fixed top-3 right-3 z-40 flex items-center gap-2 rounded-2xl border border-purple-300/70 dark:border-purple-800 bg-white/95 dark:bg-stone-900/95 p-2 shadow-lg backdrop-blur">
            <span className="hidden sm:inline px-2 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Admin
            </span>
            <button
              type="button"
              onClick={() => setIsAssetModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cek Aset</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCardsDebugOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/40 px-3 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Debug Kartu</span>
            </button>
          </div>
        )}

        <RulesModal
          isOpen={isRulesModalOpen}
          onClose={() => setIsRulesModalOpen(false)}
        />

        {isAdminRoute && (
          <>
            <AssetStatusModal
              isOpen={isAssetModalOpen}
              onClose={() => setIsAssetModalOpen(false)}
            />
            <DebugCardsModal
              isOpen={isCardsDebugOpen}
              onClose={() => setIsCardsDebugOpen(false)}
            />
          </>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Logo & Judul Game */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 shadow-md font-black text-lg">
              🏠
            </div>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight text-stone-900 dark:text-white uppercase flex items-center gap-2">
                <span>Kos-Kosan Survival</span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-bold border border-amber-300 dark:border-amber-800">
                  {players.length} Pemain
                </span>
              </h1>
              <p className="hidden md:block text-[11px] text-stone-500 dark:text-stone-400">
                Uang Saku Rp1.200.000 | Biaya Rp20.000/hari | Kos Rp450.000
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isAdminRoute && (
              <button
                onClick={() => {
                  setIsCalibrating(!isCalibrating);
                  if (!isCalibrating) {
                    setIsCalibrationModalOpen(true);
                  }
                }}
                className={`flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl transition-all ${
                  isCalibrating
                    ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-300 shadow-md'
                    : 'bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200'
                }`}
                title="Aktifkan Mode Kalibrasi Koordinat Petak"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mode Kalibrasi</span>
              </button>
            )}

            {/* Tombol Buku Saku Anak Kos */}
            <button
              onClick={() => setIsRulesModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-all"
              title="Buku Saku Anak Kos (Panduan & Aturan)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Buku Saku</span>
            </button>

            {isAdminRoute && (
              <>
              {/* Tombol Status Aset */}
              <button
                onClick={() => setIsAssetModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-all cursor-pointer"
                title="Daftar dan Status File Aset Visual"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Cek Aset</span>
              </button>
  
              {/* Tombol Mode Uji / Debug Kartu (Shortcut: D) */}
              <button
                onClick={() => setIsCardsDebugOpen(true)}
                className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-300 dark:border-purple-800 transition-all cursor-pointer"
                title="Mode Uji / Debug Kartu 15 Event (Shortcut keyboard: D)"
              >
                <Bug className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden sm:inline">Debug Kartu</span>
              </button>
              </>
            )}

            {/* Tombol Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition-colors"
              title={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>

            {/* Tombol Mulai Ulang / Ganti Jumlah Pemain (dengan konfirmasi) */}
            <button
              onClick={() => setIsRestartConfirmOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-stone-700 dark:text-stone-200 transition-colors"
              title="Ganti jumlah pemain atau mulai ulang permainan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mulai Ulang</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-6 pb-24 md:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Papan Board Utama (7 Kolom Desktop) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
          {/* Tab Giliran Pemain di ATAS papan, di LUAR area papan (Non-sticky, sejajar lebar papan) */}
          <TurnTab activePlayer={activePlayer} isGameOver={isGameOver} />

          <GameBoard
            players={players}
            activePlayerIndex={activePlayerIndex}
            tileCoords={tileCoords}
            tileTypes={TILE_TYPES}
            isCalibrating={isCalibrating}
            calibrationTargetTile={calibrationTargetTile}
            onTileCalibrated={handleTileCalibrated}
            isMoving={isMoving}
            movingPlayerId={movingPlayerId}
          />
        </div>

        {/* Kolom Kanan: Leaderboard & Riwayat (5 Kolom Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          {/* Klasemen Keuangan (Leaderboard) */}
          <Leaderboard
            players={players}
            activePlayerIndex={activePlayerIndex}
          />

          {/* Riwayat Kejadian (Activity Log) */}
          <ActivityLog logs={logs} />
        </div>
      </main>

      {/* Wadah Sticky / Floating Tunggal: Tampilan Dadu & Tombol ROLL DICE */}
      <DiceRoller
        activePlayer={activePlayer}
        onRoll={handleRollDice}
        disabled={
          isMoving ||
          activeCard !== null ||
          isGameOver ||
          isRulesModalOpen ||
          (isAdminRoute && isAssetModalOpen) ||
          (isAdminRoute && isCalibrationModalOpen) ||
          !!activePlayer?.isFinished
        }
        lastRoll={lastRoll}
        isGameOver={isGameOver}
      />

      {/* Modal Kartu Event Terbuka */}
      {activeCard && cardPlayer && (
        <CardModal
          card={activeCard}
          player={cardPlayer}
          onContinue={handleCardContinue}
        />
      )}

      {isAdminRoute && (
        <>
          {/* Tool developer hanya tersedia melalui /admin */}
          <CalibrationModal
            isOpen={isCalibrationModalOpen}
            onClose={() => setIsCalibrationModalOpen(false)}
            tileCoords={tileCoords}
            currentTargetTile={calibrationTargetTile}
            onSelectTargetTile={(tile) => setCalibrationTargetTile(tile)}
            onApplyCoords={handleApplyCoords}
            onResetCoords={handleResetCoords}
          />

          <AssetStatusModal
            isOpen={isAssetModalOpen}
            onClose={() => setIsAssetModalOpen(false)}
          />
        </>
      )}

      {/* Modal Buku Saku Anak Kos (Panduan & Aturan) */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {isAdminRoute && (
        <DebugCardsModal
          isOpen={isCardsDebugOpen}
          onClose={() => setIsCardsDebugOpen(false)}
        />
      )}

      {/* Modal Akhir Permainan (Semua Selesai) */}
      {isGameOver && (
        <GameOverModal
          players={players}
          onRestart={handleRestartGame}
        />
      )}

      {/* Modal Konfirmasi Mulai Ulang / Ganti Pemain */}
      {isRestartConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-stone-900 text-white rounded-3xl p-6 shadow-2xl border border-stone-700 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black uppercase tracking-wide">
              Mulai Ulang Permainan?
            </h3>
            <p className="text-xs text-stone-300 mt-2 mb-6 leading-relaxed">
              Yakin mau mulai ulang? Progres permainan akan hilang dan kembali ke pemilihan pemain.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsRestartConfirmOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRestartGame}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition-colors cursor-pointer"
              >
                Ya, Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
