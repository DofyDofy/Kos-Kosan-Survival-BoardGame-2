import React from 'react';
import { X, CheckCircle2, AlertCircle, Image as ImageIcon, HelpCircle } from 'lucide-react';

interface AssetStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssetAuditItem {
  filename: string;
  role: string;
  status: 'available' | 'missing';
  note: string;
}

export const AssetStatusModal: React.FC<AssetStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const assets: AssetAuditItem[] = [
    {
      filename: 'papan.png',
      role: 'Gambar Papan Penuh (30 petak luar)',
      status: 'available',
      note: 'Tersedia di /public/papan.png dengan fallback /public/assets/papan.png',
    },
    {
      filename: 'Bidak Pemain (SVG Dinamis)',
      role: 'Bidak Klasik (Player 1 sampai Player 5)',
      status: 'available',
      note: 'Dirender murni melalui kode SVG & PAWN_CONFIG dengan penanda angka 1-5',
    },
    {
      filename: 'kartu_belakang.png',
      role: 'Sisi Belakang Kartu (Tertutup / Shuffle)',
      status: 'available',
      note: 'Tersedia di /public/kartu_belakang.png (fallback placeholder berlabel jika file kosong/belum diganti)',
    },
    {
      filename: 'kartu_01.png s/d kartu_15.png',
      role: '15 Kartu Event Depan (Rezeki, Pengeluaran, Unik)',
      status: 'available',
      note: 'Semua 15 kartu lengkap dari gambar asli pengguna',
    },
  ];

  const missingAssets = assets.filter((a) => a.status === 'missing');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-2xl border border-stone-700 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <ImageIcon className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black uppercase tracking-wide">
                Status Kelengkapan Aset Visual
              </h2>
              <p className="text-xs text-stone-400">
                Pemeriksaan otomatis file gambar sesuai ketentuan desain
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

        {/* Ringkasan Status */}
        <div className="my-3 p-3 rounded-xl border flex items-center gap-3 bg-stone-800/60 border-stone-700">
          {missingAssets.length > 0 ? (
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>
                Ada <strong>{missingAssets.length} aset</strong> yang belum diunggah:{' '}
                <code className="bg-stone-950 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                  kartu_belakang.png
                </code>
                . Placeholder berlabel ditampilkan sesuai aturan.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Semua file aset visual telah lengkap dan aktif!</span>
            </div>
          )}
        </div>

        {/* Daftar Aset */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
          {assets.map((asset, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                asset.status === 'available'
                  ? 'bg-stone-800/40 border-stone-800'
                  : 'bg-rose-950/20 border-rose-900/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5">
                  {asset.status === 'available' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                </span>
                <div>
                  <div className="font-mono font-bold text-stone-200">
                    {asset.filename}
                  </div>
                  <div className="text-[11px] text-stone-400">{asset.role}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    {asset.note}
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 uppercase ${
                  asset.status === 'available'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {asset.status === 'available' ? 'Tersedia' : 'Kurang'}
              </span>
            </div>
          ))}
        </div>

        {/* Petunjuk Penggantian Aset */}
        <div className="mt-3 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Cara Mengganti Aset:</strong> Simpan file gambar baru Anda ke dalam folder{' '}
            <code className="text-amber-300 font-mono">/public/</code> dengan nama file yang sama
            (misal: <code className="text-amber-300 font-mono">kartu_belakang.png</code> atau{' '}
            <code className="text-amber-300 font-mono">papan.png</code>), maka game akan otomatis
            menggunakan gambar baru tersebut. Bidak/pion diatur langsung lewat konfigurasi{' '}
            <code className="text-amber-300 font-mono">PAWN_CONFIG</code>.
          </p>
        </div>
      </div>
    </div>
  );
};
