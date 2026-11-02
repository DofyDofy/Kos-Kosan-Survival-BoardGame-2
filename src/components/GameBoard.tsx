import React from 'react';
import { Player, TileCoord, TileDef } from '../types';
import { PAWN_CONFIG, PawnStyleConfig } from '../constants';
import { SvgPawn } from './SvgPawn';
import { motion, AnimatePresence } from 'motion/react';

interface GameBoardProps {
  players: Player[];
  activePlayerIndex: number;
  tileCoords: TileCoord[];
  tileTypes: TileDef[];
  isCalibrating: boolean;
  calibrationTargetTile: number;
  onTileCalibrated?: (tileNum: number, x: number, y: number) => void;
  isMoving: boolean;
  movingPlayerId: string | null;
}

/**
 * Menghitung pergeseran koordinat (offset %) agar bidak yang berada di petak yang sama
 * tersusun rapi tanpa saling menutupi dan tetap berada di dalam area petak.
 */
function getPawnClusterOffset(
  slotIndex: number,
  totalOnTile: number
): { dx: number; dy: number } {
  if (totalOnTile <= 1) {
    return { dx: 0, dy: 0 };
  }
  if (totalOnTile === 2) {
    // 2 bidak: Berdampingan kiri dan kanan
    return slotIndex === 0 ? { dx: -1.5, dy: 0 } : { dx: 1.5, dy: 0 };
  }
  if (totalOnTile === 3) {
    // 3 bidak: Susunan segitiga (1 di atas tengah, 2 di bawah)
    if (slotIndex === 0) return { dx: 0, dy: -1.2 };
    if (slotIndex === 1) return { dx: -1.5, dy: 1.0 };
    return { dx: 1.5, dy: 1.0 };
  }
  if (totalOnTile === 4) {
    // 4 bidak: Grid 2x2
    if (slotIndex === 0) return { dx: -1.4, dy: -1.0 };
    if (slotIndex === 1) return { dx: 1.4, dy: -1.0 };
    if (slotIndex === 2) return { dx: -1.4, dy: 1.0 };
    return { dx: 1.4, dy: 1.0 };
  }
  // 5 bidak: Susunan dadu 5 (4 sudut + 1 tengah)
  if (slotIndex === 0) return { dx: -1.6, dy: -1.2 }; // Kiri atas
  if (slotIndex === 1) return { dx: 1.6, dy: -1.2 };  // Kanan atas
  if (slotIndex === 2) return { dx: 0, dy: 0 };       // Tengah
  if (slotIndex === 3) return { dx: -1.6, dy: 1.2 };  // Kiri bawah
  return { dx: 1.6, dy: 1.2 };                       // Kanan bawah
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  activePlayerIndex,
  tileCoords,
  tileTypes,
  isCalibrating,
  calibrationTargetTile,
  onTileCalibrated,
  isMoving,
  movingPlayerId,
}) => {
  // Handler klik papan saat Mode Kalibrasi aktif
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCalibrating || !onTileCalibrated) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPct = Number(((clickX / rect.width) * 100).toFixed(1));
    const yPct = Number(((clickY / rect.height) * 100).toFixed(1));

    onTileCalibrated(calibrationTargetTile, xPct, yPct);
  };

  // Hitung jumlah pemain di setiap petak untuk penataan cluster
  const tileOccupants: Record<number, Player[]> = {};
  players.forEach((p) => {
    if (!tileOccupants[p.tile]) {
      tileOccupants[p.tile] = [];
    }
    tileOccupants[p.tile].push(p);
  });

  return (
    <div className="relative w-full max-w-[720px] mx-auto select-none">
      {/* Container Papan dengan Rasio Asli Desain (999 : 888) */}
      <div
        onClick={handleBoardClick}
        className={`relative w-full aspect-[999/888] rounded-2xl overflow-hidden shadow-2xl bg-amber-50/50 border border-amber-900/10 ${
          isCalibrating ? 'cursor-crosshair ring-4 ring-amber-500' : 'cursor-default'
        }`}
      >
        {/* Gambar Papan Asli Buatan Pengguna - Tidak diganti atau ditimpa warna */}
        <img
          src="/papan.png"
          alt="Papan Kos-Kosan Survival"
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/papan.png';
          }}
        />

        {/* Overlay Indikator Petak Khusus (Hanya garis halus tipis saat hover, tanpa menimpa warna desain) */}
        {tileCoords.map((coord) => {
          const tileInfo = tileTypes.find((t) => t.tile === coord.tile);
          const isTargetInCalibration = isCalibrating && calibrationTargetTile === coord.tile;

          return (
            <div
              key={`tile-${coord.tile}`}
              style={{
                left: `${coord.x}%`,
                top: `${coord.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={tileInfo ? `${tileInfo.name}: ${tileInfo.description}` : `Petak ${coord.tile}`}
              className={`absolute transition-all duration-200 pointer-events-none ${
                isCalibrating ? 'pointer-events-auto' : ''
              }`}
            >
              {/* Marker Kalibrasi */}
              {isCalibrating && (
                <div
                  className={`flex items-center justify-center text-[10px] font-bold rounded-full w-6 h-6 shadow-md transition-transform ${
                    isTargetInCalibration
                      ? 'bg-rose-500 text-white scale-125 ring-4 ring-rose-300 animate-bounce'
                      : 'bg-black/80 text-white hover:scale-110'
                  }`}
                >
                  {coord.tile}
                </div>
              )}
            </div>
          );
        })}

        {/* Lapisan Bidak / Pion Pemain (Murni SVG Sesuai Aturan Baru) */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {players.map((player, idx) => {
              const coord = tileCoords.find((c) => c.tile === player.tile) || { x: 5.6, y: 6.2 };

              // Hitung offset penataan jika ada beberapa bidak di petak yang sama
              const occupantsOnTile = tileOccupants[player.tile] || [player];
              const slotIndex = occupantsOnTile.findIndex((p) => p.id === player.id);
              const clusterOffset = getPawnClusterOffset(
                slotIndex >= 0 ? slotIndex : 0,
                occupantsOnTile.length
              );

              const pawnX = coord.x + clusterOffset.dx;
              const pawnY = coord.y + clusterOffset.dy;

              const isActive = idx === activePlayerIndex;
              const isCurrentlyWalking = isMoving && movingPlayerId === player.id;
              const isFinished = player.isFinished;

              const config: PawnStyleConfig = PAWN_CONFIG.players[player.id] || {
                primaryColor: player.color,
                gradientTop: '#ffffff',
                gradientBottom: '#1c1917',
                markerNumber: player.markerNumber || idx + 1,
                textColor: '#ffffff',
                badgeClass: player.badgeBg,
              };

              return (
                <motion.div
                  key={`pawn-${player.id}`}
                  initial={false}
                  animate={{
                    left: `${pawnX}%`,
                    top: `${pawnY}%`,
                    scale: isCurrentlyWalking
                      ? 1.25
                      : isActive
                      ? [1.08, 1.15, 1.08]
                      : isFinished
                      ? 0.95
                      : 1,
                    y: isCurrentlyWalking
                      ? [0, -12, 0]
                      : isActive
                      ? [0, -4, 0]
                      : 0,
                    opacity: isFinished ? 0.8 : 1,
                  }}
                  transition={{
                    left: { type: 'spring', stiffness: 380, damping: 28 },
                    top: { type: 'spring', stiffness: 380, damping: 28 },
                    scale: isCurrentlyWalking
                      ? { duration: 0.2 }
                      : isActive
                      ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                      : { duration: 0.25 },
                    y: isCurrentlyWalking
                      ? { repeat: Infinity, duration: 0.22, ease: 'easeInOut' }
                      : isActive
                      ? { repeat: Infinity, duration: 1.8, ease: 'easeInOut' }
                      : { duration: 0.25 },
                  }}
                  style={{
                    position: 'absolute',
                    // Titik tumpu dasar bidak tepat di tengah petak
                    transform: 'translate(-50%, -92%)',
                    zIndex: isCurrentlyWalking ? 50 : isActive ? 40 : 20 + idx,
                    width: `${PAWN_CONFIG.widthPercent}%`,
                    minWidth: '20px',
                    maxWidth: '34px',
                  }}
                  className="flex flex-col items-center pointer-events-auto cursor-pointer"
                  title={`${player.name} (Bidak #${config.markerNumber}) - Petak ${player.tile}`}
                  aria-label={`Bidak ${player.name} di Petak ${player.tile}`}
                >
                  <SvgPawn
                    config={config}
                    isActive={isActive}
                    isFinished={isFinished}
                    isMoving={isCurrentlyWalking}
                  />

                  {/* PENTING ATURAN 1: "Jangan tampilkan nama pemain di atas bidak. Nama hanya di indikator giliran dan leaderboard." */}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Banner Status Mode Kalibrasi */}
        {isCalibrating && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-amber-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur flex items-center gap-2 border border-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
            <span>
              Kalibrasi Petak <strong>#{calibrationTargetTile}</strong>: Klik titik tengah petak di papan
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
