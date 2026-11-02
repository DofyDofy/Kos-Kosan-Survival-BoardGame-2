import React, { useRef, useEffect } from 'react';
import { GameLog } from '../types';
import { formatRupiah } from '../utils/format';
import { History, Home, DollarSign, AlertCircle, Compass } from 'lucide-react';

interface ActivityLogProps {
  logs: GameLog[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-md rounded-2xl p-4 md:p-5 shadow-lg border border-stone-200 dark:border-stone-800 flex flex-col h-64 md:h-72">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-stone-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-stone-900 dark:text-white">
            Riwayat Kejadian (Log)
          </h3>
        </div>
        <span className="text-[10px] text-stone-400 font-mono">
          {logs.length} catatan
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs divide-y divide-stone-100 dark:divide-stone-800/40"
      >
        {logs.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            Belum ada aktivitas. Tekan &quot;Lempar Dadu&quot; untuk memulai!
          </div>
        ) : (
          logs.map((log) => {
            const isGain = log.amount !== undefined && log.amount > 0;
            const isLoss = log.amount !== undefined && log.amount < 0;

            return (
              <div key={log.id} className="pt-2 first:pt-0 flex items-start gap-2">
                {/* Ikon berdasarkan tipe log */}
                <div className="mt-0.5 flex-shrink-0">
                  {log.type === 'kos' ? (
                    <span className="inline-flex p-1 rounded-md bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                      <Home className="w-3.5 h-3.5" />
                    </span>
                  ) : log.type === 'card' ? (
                    <span className="inline-flex p-1 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                      <DollarSign className="w-3.5 h-3.5" />
                    </span>
                  ) : log.type === 'daily' ? (
                    <span className="inline-flex p-1 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="inline-flex p-1 rounded-md bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                      <Compass className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Konten Log */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {log.playerName}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    {log.message}
                  </p>
                </div>

                {/* Tag Nominal jika ada */}
                {log.amount !== undefined && log.amount !== 0 && (
                  <span
                    className={`font-mono text-[11px] font-bold flex-shrink-0 ${
                      isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isGain ? `+${formatRupiah(log.amount)}` : formatRupiah(log.amount)}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
