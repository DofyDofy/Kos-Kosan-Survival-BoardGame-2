import React, { useState } from 'react';
import { X, BookOpen, Home, DollarSign, AlertTriangle, ShieldCheck, Flag, Users } from 'lucide-react';
import { KOS_BILL, DAILY_EXPENSE, STARTING_MONEY, STATUS_THRESHOLDS, CARDS } from '../constants';
import { formatRupiah } from '../utils/format';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [showCards, setShowCards] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-2xl border border-stone-700 max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide text-white">
                Buku Saku Anak Kos
              </h2>
              <p className="text-xs text-stone-400">
                Panduan bertahan hidup 30 hari & aturan permainan
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

        {/* Konten Buku Saku */}
        <div className="flex-1 overflow-y-auto space-y-4 my-3 pr-1 text-xs text-stone-300">
          {/* Format Pemain */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <div className="flex items-center gap-2 font-black text-amber-400 uppercase text-[11px] tracking-wider">
              <Users className="w-4 h-4" />
              <span>Format Permainan</span>
            </div>
            <p className="text-[11px] text-stone-200 leading-relaxed">
              Dua sampai lima pemain bergantian di satu perangkat. Setiap pemain mengendalikan satu bidak dengan uang saku awal masing-masing Rp1.200.000 untuk bertahan hidup selama 30 hari.
            </p>
          </div>

          {/* 1. Aturan Finansial */}
          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-400 uppercase text-[11px] tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>Uang Saku & Biaya Hidup</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-[11px] text-stone-300 leading-relaxed">
              <li>
                <strong>Uang Saku Awal:</strong> Tiap mahasiswa dibekali{' '}
                <span className="text-emerald-400 font-bold">{formatRupiah(STARTING_MONEY)}</span> di awal bulan.
              </li>
              <li>
                <strong>Biaya Hidup Harian:</strong> Membayar{' '}
                <span className="text-rose-400 font-bold">{formatRupiah(DAILY_EXPENSE)}</span> per petak langkah (makan, minum, kebutuhan pokok).
              </li>
              <li>
                <strong>Tagihan Sewa Kos (Petak 5):</strong> Tagihan sewa kamar kos sebesar{' '}
                <span className="text-rose-400 font-bold">{formatRupiah(KOS_BILL)}</span> dipotong tepat{' '}
                <strong>satu kali</strong> saat pemain mendarat atau melintasi Petak 5.
              </li>
            </ul>
          </div>

          {/* 2. Sistem Petak & Kartu Event */}
          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
            <div className="flex items-center gap-2 font-black text-blue-400 uppercase text-[11px] tracking-wider">
              <Home className="w-4 h-4" />
              <span>Sistem Petak & Kartu Event</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-stone-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 min-w-[70px]">Rezeki:</span>
                <span>Petak 4, 10, 18, 26 memicu kartu tambahan saldo (+Rp20.000 s/d +Rp50.000).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-rose-400 min-w-[70px]">Tak Terduga:</span>
                <span>Petak 22, 27, 29 memicu pengeluaran darurat akhir bulan (-Rp50.000 s/d -Rp100.000).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-purple-400 min-w-[70px]">Event Umum:</span>
                <span>Petak 7, 13, 16, 20 memiliki peluang 40% Rezeki, 45% Pengeluaran, 15% Kejadian Unik.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-stone-400 min-w-[70px]">Harian:</span>
                <span>Petak biasa hanya mengenakan biaya hidup harian tanpa kartu.</span>
              </li>
            </ul>

            {/* Tombol Lihat 15 Kartu Kejadian */}
            <div className="pt-2 border-t border-stone-700/60">
              <button
                type="button"
                onClick={() => setShowCards(!showCards)}
                className="w-full py-2 px-3 rounded-xl bg-stone-900/80 hover:bg-stone-900 border border-stone-700 text-amber-400 font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>{showCards ? 'Sembunyikan' : 'Lihat'} 15 Kartu Kejadian</span>
                <span className="text-[10px] text-stone-400 font-normal">
                  {showCards ? 'Tutup daftar' : 'Buka daftar kartu'}
                </span>
              </button>

              {showCards && (
                <div className="mt-2.5 space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {CARDS.map((card) => (
                    <div
                      key={card.id}
                      className="p-2 rounded-xl bg-stone-900/90 border border-stone-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-amber-400 font-bold bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 flex-shrink-0">
                          {card.file}
                        </span>
                        <span className="font-bold text-stone-200 truncate text-[11px]">
                          {card.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            card.category === 'REZEKI'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : card.category === 'PENGELUARAN'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}
                        >
                          {card.categoryLabel}
                        </span>
                        <span
                          className={`font-black text-[11px] ${
                            card.isChoice
                              ? 'text-amber-300'
                              : card.amount > 0
                              ? 'text-emerald-400'
                              : card.amount < 0
                              ? 'text-rose-400'
                              : 'text-stone-300'
                          }`}
                        >
                          {card.isChoice
                            ? `Pilihan: IKUT -50rb / TOLAK 0`
                            : card.amount > 0
                            ? `+${formatRupiah(card.amount)}`
                            : formatRupiah(card.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Garis Akhir (Finish) */}
          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
            <div className="flex items-center gap-2 font-black text-emerald-400 uppercase text-[11px] tracking-wider">
              <Flag className="w-4 h-4" />
              <span>Garis Finish (Petak 30)</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Garis finish adalah <strong>Petak 30</strong>. Pemain yang mencapai atau melampaui Petak 30 langsung
              berhenti di Petak 30 dan berstatus <strong>SELESAI</strong>. Pemain yang sudah selesai dilewati dalam giliran,
              dan permainan berakhir saat semua pemain berhasil menyelesaikan 30 hari. Pemenang adalah mahasiswa dengan sisa saldo tertinggi!
            </p>
          </div>

          {/* 4. Ambang Batas Status Keuangan */}
          <div className="p-3.5 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
            <div className="flex items-center gap-2 font-black text-stone-400 uppercase text-[11px] tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Status Keuangan</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300">
                <strong className="block text-emerald-400">Aman</strong>
                Saldo &ge; {formatRupiah(STATUS_THRESHOLDS.SAFE)}
              </div>
              <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300">
                <strong className="block text-amber-400">Menipis</strong>
                &ge; {formatRupiah(STATUS_THRESHOLDS.WARNING)}
              </div>
              <div className="p-2 rounded-xl bg-orange-950/40 border border-orange-800 text-orange-300">
                <strong className="block text-orange-400">Kritis</strong>
                &ge; {formatRupiah(STATUS_THRESHOLDS.CRITICAL)}
              </div>
              <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300">
                <strong className="block text-rose-400">Bangkrut (Utang)</strong>
                Saldo &lt; Rp0
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tombol Tutup */}
        <div className="pt-3 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black transition-colors"
          >
            Mengerti, Lanjut Main
          </button>
        </div>
      </div>
    </div>
  );
};
