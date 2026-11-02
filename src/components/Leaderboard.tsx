import React from 'react';
import { Player } from '../types';
import { formatRupiah, getFinancialStatus, getStatusStyle } from '../utils/format';
import { Trophy, TrendingUp, AlertTriangle } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  activePlayerIndex: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  activePlayerIndex,
}) => {
  // Urutkan pemain dari saldo tertinggi ke terendah
  const sortedPlayers = [...players].sort((a, b) => b.balance - a.balance);

  return (
    <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg border border-stone-200 dark:border-stone-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-stone-900 dark:text-white">
            Klasemen Keuangan Mahasiswa
          </h2>
        </div>
        <span className="text-[11px] text-stone-400 font-medium">
          Target: Bertahan 30 Hari
        </span>
      </div>

      {/* Tabel Klasemen */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800">
              <th className="py-2 px-2 text-center w-8">#</th>
              <th className="py-2 px-2">Pemain</th>
              <th className="py-2 px-2 text-right">Saldo Terkini</th>
              <th className="py-2 px-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
            {sortedPlayers.map((player, rankIdx) => {
              const status = getFinancialStatus(player.balance);
              const statusStyle = getStatusStyle(status);
              const isCurrentTurn = players[activePlayerIndex]?.id === player.id;

              return (
                <tr
                  key={player.id}
                  className={`text-xs transition-colors ${
                    isCurrentTurn
                      ? 'bg-amber-500/10 font-semibold'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  {/* Peringkat */}
                  <td className="py-2.5 px-2 text-center font-bold text-stone-500">
                    {rankIdx === 0 ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 font-black text-[11px]">
                        1
                      </span>
                    ) : (
                      rankIdx + 1
                    )}
                  </td>

                  {/* Nama Pemain */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        style={{ backgroundColor: player.color }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 shadow-sm"
                        title={`Pemain #${player.markerNumber || rankIdx + 1}`}
                      >
                        {player.markerNumber || rankIdx + 1}
                      </div>
                      <span
                        className="text-stone-900 dark:text-stone-100 truncate max-w-[90px] sm:max-w-[120px] md:max-w-[160px]"
                        title={player.name}
                      >
                        {player.name}
                      </span>
                      {player.isFinished ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white font-black uppercase flex items-center gap-0.5 shadow-sm">
                          <span>✓</span> Selesai
                        </span>
                      ) : isCurrentTurn ? (
                        <span className="hidden sm:inline-block text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-white font-black uppercase">
                          Giliran
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {/* Saldo Terkini */}
                  <td className="py-2.5 px-2 text-right font-mono font-bold">
                    <span
                      className={
                        player.balance < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }
                    >
                      {formatRupiah(player.balance)}
                    </span>
                  </td>

                  {/* Status Keuangan */}
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.badge}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                      <span>{status}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Catatan Ambang Batas (Sesuai Ketentuan Bagian 10) */}
      <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-400 flex flex-wrap items-center justify-between gap-1">
        <span>Aman: ≥Rp600k</span>
        <span>Menipis: ≥Rp250k</span>
        <span>Kritis: ≥Rp0</span>
        <span>Bangkrut: &lt;Rp0</span>
      </div>
    </div>
  );
};
