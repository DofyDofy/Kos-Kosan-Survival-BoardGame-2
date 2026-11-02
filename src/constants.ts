import { CardDef, Player, TileCoord, TileDef } from './types';

// ==========================================
// 1. KONFIGURASI FINANSIAL & GAME
// ==========================================
export const STARTING_MONEY = 1_200_000; // Uang saku awal mahasiswa: Rp1.200.000
export const DAILY_EXPENSE = 20_000;    // Biaya hidup harian per langkah: Rp20.000
export const KOS_BILL = 450_000;        // Tagihan sewa kos di Petak 5: Rp450.000
export const TOTAL_TILES = 30;          // Total petak keliling papan: 30 hari

// ==========================================
// 2. AMBANG BATAS STATUS KEUANGAN (LEADERBOARD)
// ==========================================
// - Aman    : Saldo >= Rp600.000 (masih aman sampai akhir bulan)
// - Menipis : Rp250.000 <= Saldo < Rp600.000 (harus mulai kurangi jajan)
// - Kritis  : Rp0 <= Saldo < Rp250.000 (uang menipis, andalkan mie instan)
// - Bangkrut: Saldo < Rp0 (kehabisan uang / berhutang)
export const STATUS_THRESHOLDS = {
  SAFE: 600_000,
  WARNING: 250_000,
  CRITICAL: 0,
};

// ==========================================
// 3. PELUANG KARTU PADA PETAK EVENT UMUM
// ==========================================
// 40% Rezeki, 45% Pengeluaran, 15% Kejadian Unik
export const EVENT_PROBABILITIES = {
  REZEKI: 0.40,
  PENGELUARAN: 0.45,
  UNIK: 0.15,
};

// ==========================================
// 4. SUSUNAN 30 PETAK PAPAN (TILE_TYPES)
// ==========================================
// Mengikuti desain visual papan:
// - Petak 1: START
// - Petak 5: Bayar Kos (Tagihan Rp450.000)
// - 4 Petak Rezeki: 4, 10, 18, 26
// - 3 Petak Pengeluaran Tak Terduga: 22, 27, 29 (hanya di 21-30)
// - 4 Petak Event Umum: 7, 13, 16, 20
// - 17 Petak Harian: 2, 3, 6, 8, 9, 11, 12, 14, 15, 17, 19, 21, 23, 24, 25, 28, 30
export const TILE_TYPES: TileDef[] = [
  { tile: 1,  type: 'START',                    name: 'START',                description: 'Awal bulan & penerimaan uang saku' },
  { tile: 2,  type: 'HARIAN',                   name: 'Hari 2 - Harian',       description: 'Makan warteg & kebutuhan harian' },
  { tile: 3,  type: 'HARIAN',                   name: 'Hari 3 - Harian',       description: 'Makan siang & fotokopi materi' },
  { tile: 4,  type: 'REZEKI',                   name: 'Hari 4 - Rezeki',       description: 'Dapat rezeki tak terduga!' },
  { tile: 5,  type: 'KOS',                      name: 'Hari 5 - Bayar Kos',    description: 'Tagihan sewa kamar kos Rp450.000' },
  { tile: 6,  type: 'HARIAN',                   name: 'Hari 6 - Harian',       description: 'Beli galon & sabun mandi' },
  { tile: 7,  type: 'EVENT_UMUM',               name: 'Hari 7 - Event',        description: 'Ambil 1 kartu event acak' },
  { tile: 8,  type: 'HARIAN',                   name: 'Hari 8 - Harian',       description: 'Beli nasi padang bungkus' },
  { tile: 9,  type: 'HARIAN',                   name: 'Hari 9 - Harian',       description: 'Bensin motor ke kampus' },
  { tile: 10, type: 'REZEKI',                   name: 'Hari 10 - Rezeki',      description: 'Dapat rezeki tambahan!' },
  { tile: 11, type: 'HARIAN',                   name: 'Hari 11 - Harian',      description: 'Makan malam indomie telor' },
  { tile: 12, type: 'HARIAN',                   name: 'Hari 12 - Harian',      description: 'Print tugas laporan praktikum' },
  { tile: 13, type: 'EVENT_UMUM',               name: 'Hari 13 - Event',       description: 'Ambil 1 kartu event acak' },
  { tile: 14, type: 'HARIAN',                   name: 'Hari 14 - Harian',      description: 'Beli cemilan malam & kopi saset' },
  { tile: 15, type: 'HARIAN',                   name: 'Hari 15 - Harian',      description: 'Pertengahan bulan, makan hemat' },
  { tile: 16, type: 'EVENT_UMUM',               name: 'Hari 16 - Event',       description: 'Ambil 1 kartu event acak' },
  { tile: 17, type: 'HARIAN',                   name: 'Hari 17 - Harian',      description: 'Laundry kiloan baju kotor' },
  { tile: 18, type: 'REZEKI',                   name: 'Hari 18 - Rezeki',      description: 'Dapat rezeki pertengahan bulan!' },
  { tile: 19, type: 'HARIAN',                   name: 'Hari 19 - Harian',      description: 'Makan siang warteg hemat' },
  { tile: 20, type: 'EVENT_UMUM',               name: 'Hari 20 - Event',       description: 'Ambil 1 kartu event acak' },
  { tile: 21, type: 'HARIAN',                   name: 'Hari 21 - Harian',      description: 'Beli sabun cuci piring kos' },
  { tile: 22, type: 'PENGELUARAN_TAK_TERDUGA',  name: 'Hari 22 - Tak Terduga', description: 'Pengeluaran darurat akhir bulan!' },
  { tile: 23, type: 'HARIAN',                   name: 'Hari 23 - Harian',      description: 'Patungan iuran sampah & wifi kos' },
  { tile: 24, type: 'HARIAN',                   name: 'Hari 24 - Harian',      description: 'Beli telur setengah kilo' },
  { tile: 25, type: 'HARIAN',                   name: 'Hari 25 - Harian',      description: 'Makan hemat tanggal tua' },
  { tile: 26, type: 'REZEKI',                   name: 'Hari 26 - Rezeki',      description: 'Rezeki penolong di tanggal tua!' },
  { tile: 27, type: 'PENGELUARAN_TAK_TERDUGA',  name: 'Hari 27 - Tak Terduga', description: 'Pengeluaran mendadak!' },
  { tile: 28, type: 'HARIAN',                   name: 'Hari 28 - Harian',      description: 'Bertahan dengan lauk tempe' },
  { tile: 29, type: 'PENGELUARAN_TAK_TERDUGA',  name: 'Hari 29 - Tak Terduga', description: 'Ujian terakhir dompet mahasiswa!' },
  { tile: 30, type: 'HARIAN',                   name: 'Hari 30 - Harian',      description: 'Hari terakhir! Berhasil bertahan!' },
];

// ==========================================
// 5. KOORDINAT TITIK TENGAH PETAK (TILE_COORDS)
// ==========================================
// Nilai (x, y) dalam persen (0-100%) terhadap ukuran gambar papan (999 x 888 px).
// Dapat dikalibrasi secara interaktif melalui "Mode Kalibrasi" di dalam game.
export const TILE_COORDS: TileCoord[] = [
  // Sisi Atas (Kiri ke Kanan): Petak 1 s/d 9
  { tile: 1,  x: 5.6,  y: 6.2 },
  { tile: 2,  x: 16.8, y: 6.2 },
  { tile: 3,  x: 27.8, y: 6.2 },
  { tile: 4,  x: 38.8, y: 6.2 },
  { tile: 5,  x: 49.8, y: 6.2 },
  { tile: 6,  x: 60.8, y: 6.2 },
  { tile: 7,  x: 71.8, y: 6.2 },
  { tile: 8,  x: 82.8, y: 6.2 },
  { tile: 9,  x: 94.2, y: 6.2 },

  // Sisi Kanan (Atas ke Bawah): Petak 10 s/d 15
  { tile: 10, x: 94.2, y: 18.5 },
  { tile: 11, x: 94.2, y: 31.0 },
  { tile: 12, x: 94.2, y: 43.5 },
  { tile: 13, x: 94.2, y: 56.0 },
  { tile: 14, x: 94.2, y: 68.5 },
  { tile: 15, x: 94.2, y: 81.0 },

  // Sisi Bawah (Kanan ke Kiri): Petak 16 s/d 24
  { tile: 16, x: 94.2, y: 93.5 },
  { tile: 17, x: 82.8, y: 93.5 },
  { tile: 18, x: 71.8, y: 93.5 },
  { tile: 19, x: 60.8, y: 93.5 },
  { tile: 20, x: 49.8, y: 93.5 },
  { tile: 21, x: 38.8, y: 93.5 },
  { tile: 22, x: 27.8, y: 93.5 },
  { tile: 23, x: 16.8, y: 93.5 },
  { tile: 24, x: 5.6,  y: 93.5 },

  // Sisi Kiri (Bawah ke Atas): Petak 25 s/d 30
  { tile: 25, x: 5.6,  y: 81.0 },
  { tile: 26, x: 5.6,  y: 68.5 },
  { tile: 27, x: 5.6,  y: 56.0 },
  { tile: 28, x: 5.6,  y: 43.5 },
  { tile: 29, x: 5.6,  y: 31.0 },
  { tile: 30, x: 5.6,  y: 18.5 },
];

// ==========================================
// 6. DAFTAR 15 KARTU EVENT (CARDS)
// ==========================================
// Memuat data lengkap sesuai 15 kejadian di petunjuk:
// A. Rezeki (Rp10.000 - Rp50.000)
// B. Pengeluaran (Rp30.000 - Rp100.000)
// C. Kejadian Unik
export const CARDS: CardDef[] = [
  // --- Kategori Pengeluaran (kartu_01 s/d kartu_06) ---
  {
    id: 1,
    file: 'kartu_01.png',
    title: 'Ban motor bocor',
    category: 'PENGELUARAN',
    categoryLabel: 'Pengeluaran',
    amount: -50_000,
    image: '/kartu_01.png',
    description: 'Kena paku di jalan, harus ganti ban dalam baru.',
  },
  {
    id: 2,
    file: 'kartu_02.png',
    title: 'Laptop bermasalah',
    category: 'PENGELUARAN',
    categoryLabel: 'Pengeluaran',
    amount: -100_000,
    image: '/kartu_02.png',
    description: 'Layar laptop bergaris dan butuh servis darurat.',
  },
  {
    id: 3,
    file: 'kartu_03.png',
    title: 'Sakit, beli obat dulu',
    category: 'PENGELUARAN',
    categoryLabel: 'Pengeluaran',
    amount: -50_000,
    image: '/kartu_03.png',
    description: 'Masuk angin dan demam, harus beli vitamin dan obat apotek.',
  },
  {
    id: 4,
    file: 'kartu_04.png',
    title: 'Kuota internet habis',
    category: 'PENGELUARAN',
    categoryLabel: 'Pengeluaran',
    amount: -30_000,
    image: '/kartu_04.png',
    description: 'Wifi kosan lagi lemot, terpaksa isi kuota darurat.',
  },
  {
    id: 5,
    file: 'kartu_05.png',
    title: 'Tugas kelompok mendadak',
    category: 'PENGELUARAN',
    categoryLabel: 'Pengeluaran',
    amount: -40_000,
    image: '/kartu_05.png',
    description: 'Kerja kelompok di kafe sambil print proposal bersama.',
  },
  {
    id: 6,
    file: 'kartu_06.png',
    title: 'Motor mogok',
    category: 'PENGELUARAN',
    categoryLabel: 'Pengeluaran',
    amount: -100_000,
    image: '/kartu_06.png',
    description: 'Busi mati di jalan, harus mampir ke bengkel.',
  },

  // --- Kategori Rezeki (kartu_07 s/d kartu_11) ---
  {
    id: 7,
    file: 'kartu_07.png',
    title: 'Barang bekas, rezeki baru',
    category: 'REZEKI',
    categoryLabel: 'Rezeki',
    amount: 30_000,
    image: '/kartu_07.png',
    description: 'Jual buku kuliah dan kardus tak terpakai.',
  },
  {
    id: 8,
    file: 'kartu_08.png',
    title: 'Kerja sampingan berbuah manis',
    category: 'REZEKI',
    categoryLabel: 'Rezeki',
    amount: 50_000,
    image: '/kartu_08.png',
    description: 'Gaji kerja part-time akhirnya ditransfer.',
  },
  {
    id: 9,
    file: 'kartu_09.png',
    title: 'Kiriman tambahan orang tua',
    category: 'REZEKI',
    categoryLabel: 'Rezeki',
    amount: 50_000,
    image: '/kartu_09.png',
    description: 'Ortu tiba-tiba kirim saldo ekstra buat jajan!',
  },
  {
    id: 10,
    file: 'kartu_10.png',
    title: 'Bayaran joki tugas',
    category: 'REZEKI',
    categoryLabel: 'Rezeki',
    amount: 40_000,
    image: '/kartu_10.png',
    description: 'Bantu ngerjain tugas kating, langsung dibayar lunas.',
  },
  {
    id: 11,
    file: 'kartu_11.png',
    title: 'Cashback belanja cair!',
    category: 'REZEKI',
    categoryLabel: 'Rezeki',
    amount: 20_000,
    image: '/kartu_11.png',
    description: 'Promo e-wallet memberikan reward cashback langsung.',
  },

  // --- Kategori Kejadian Unik (kartu_12 s/d kartu_15) ---
  {
    id: 12,
    file: 'kartu_12.png',
    title: 'Ditraktir teman',
    category: 'UNIK',
    categoryLabel: 'Kejadian Unik',
    amount: 25_000,
    image: '/kartu_12.png',
    description: 'Teman satu geng lagi ulang tahun dan traktir makan kenyang!',
  },
  {
    id: 13,
    file: 'kartu_13.png',
    title: 'Harta di saku lama',
    category: 'UNIK',
    categoryLabel: 'Kejadian Unik',
    amount: 15_000,
    image: '/kartu_13.png',
    description: 'Nemu uang kertas lecek di saku celana jeans lama.',
  },
  {
    id: 14,
    file: 'kartu_14.png',
    title: 'Diajak nongkrong',
    category: 'UNIK',
    categoryLabel: 'Kejadian Unik',
    amount: 0,
    isChoice: true,
    choiceExpense: -50_000, // Pilihan: IKUT -50.000 atau TOLAK 0
    image: '/kartu_14.png',
    description: 'Pilihan: IKUT (-Rp50.000) atau TOLAK (Rp0).',
  },
  {
    id: 15,
    file: 'kartu_15.png',
    title: 'Makanan gratis tetangga kos',
    category: 'UNIK',
    categoryLabel: 'Kejadian Unik',
    amount: 20_000,
    image: '/kartu_15.png',
    description: 'Ibu kos bawa berkat syukuran nasi sate melimpah.',
  },
];

// ==========================================
// ==========================================
// KONFIGURASI TAMPILAN BIDAK / PION (PAWN_CONFIG)
// ==========================================
// Dibuat murni dengan SVG/CSS tanpa aset gambar.
// - Bentuk: Pion klasik board game (kepala bulat, leher ramping, badan kerucut melengkung, alas lingkaran).
// - Ukuran: Lebar & tinggi proporsional terhadap ukuran petak papan.
// - Aksesibilitas: Warna kontras tinggi + penanda angka 1-5 di badan pion.
// ==========================================
// ==========================================
// 5. BATAS JUMLAH PEMAIN & KONFIGURASI NAMA
// ==========================================
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const MAX_NAME_LENGTH = 12;

export const DEFAULT_PLAYER_NAMES = [
  'Player 1',
  'Player 2',
  'Player 3',
  'Player 4',
  'Player 5',
];

export function getDefaultPlayerName(index: number): string {
  return DEFAULT_PLAYER_NAMES[index] || `Player ${index + 1}`;
}

/**
 * Normalisasi nama pemain:
 * - Hapus spasi di awal dan di akhir (trim)
 * - Rapikan spasi ganda / berturut-turut di tengah menjadi satu spasi
 */
export function normalizePlayerName(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/\s+/g, ' ');
}

export interface PawnStyleConfig {
  primaryColor: string;    // Warna utama bidak
  gradientTop: string;     // Highlight atas bidak
  gradientBottom: string;  // Bayangan bawah bidak
  markerNumber: number;    // Penanda angka unik (1-5)
  textColor: string;       // Warna teks penanda angka
  badgeClass: string;      // Kelas Tailwind untuk badge / titik warna
}

export const PAWN_CONFIG: {
  widthPercent: number;    // Lebar bidak dalam % terhadap lebar papan
  aspectRatio: number;     // Rasio tinggi terhadap lebar
  players: Record<string, PawnStyleConfig>;
} = {
  // Lebar ~3.8% terhadap lebar papan: proporsional dan tidak menutupi teks/ikon petak
  widthPercent: 3.8,
  aspectRatio: 1.36,
  players: {
    p1: {
      primaryColor: '#ef4444',   // Merah solid
      gradientTop: '#fca5a5',    // Merah muda highlight
      gradientBottom: '#b91c1c', // Merah tua bayangan
      markerNumber: 1,
      textColor: '#ffffff',
      badgeClass: 'bg-red-500',
    },
    p2: {
      primaryColor: '#2563eb',   // Biru solid
      gradientTop: '#93c5fd',    // Biru muda highlight
      gradientBottom: '#1d4ed8', // Biru tua bayangan
      markerNumber: 2,
      textColor: '#ffffff',
      badgeClass: 'bg-blue-600',
    },
    p3: {
      primaryColor: '#16a34a',   // Hijau solid
      gradientTop: '#86efac',    // Hijau muda highlight
      gradientBottom: '#15803d', // Hijau tua bayangan
      markerNumber: 3,
      textColor: '#ffffff',
      badgeClass: 'bg-emerald-600',
    },
    p4: {
      primaryColor: '#eab308',   // Kuning solid
      gradientTop: '#fef08a',    // Kuning muda highlight
      gradientBottom: '#a16207', // Kuning tua bayangan
      markerNumber: 4,
      textColor: '#451a03',
      badgeClass: 'bg-amber-500',
    },
    p5: {
      primaryColor: '#9333ea',   // Ungu solid
      gradientTop: '#d8b4fe',    // Ungu muda highlight
      gradientBottom: '#6b21a8', // Ungu tua bayangan
      markerNumber: 5,
      textColor: '#ffffff',
      badgeClass: 'bg-purple-600',
    },
  },
};

// ==========================================
// 7. DATA MASTER 5 PEMAIN (Player 1 s/d Player 5)
// ==========================================
// - Player 1: Merah (#ef4444, #1)
// - Player 2: Biru (#2563eb, #2)
// - Player 3: Hijau (#16a34a, #3)
// - Player 4: Kuning (#eab308, #4)
// - Player 5: Ungu (#9333ea, #5)
export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Player 1',
    color: '#ef4444', // Merah
    badgeBg: 'bg-red-500',
    markerNumber: 1,
    tile: 1,
    balance: STARTING_MONEY,
    hasPaidKos: false,
    lapCompleted: false,
    isFinished: false,
    totalRezeki: 0,
    totalPengeluaran: 0,
    isTurn: true,
  },
  {
    id: 'p2',
    name: 'Player 2',
    color: '#2563eb', // Biru
    badgeBg: 'bg-blue-600',
    markerNumber: 2,
    tile: 1,
    balance: STARTING_MONEY,
    hasPaidKos: false,
    lapCompleted: false,
    isFinished: false,
    totalRezeki: 0,
    totalPengeluaran: 0,
    isTurn: false,
  },
  {
    id: 'p3',
    name: 'Player 3',
    color: '#16a34a', // Hijau
    badgeBg: 'bg-emerald-600',
    markerNumber: 3,
    tile: 1,
    balance: STARTING_MONEY,
    hasPaidKos: false,
    lapCompleted: false,
    isFinished: false,
    totalRezeki: 0,
    totalPengeluaran: 0,
    isTurn: false,
  },
  {
    id: 'p4',
    name: 'Player 4',
    color: '#eab308', // Kuning
    badgeBg: 'bg-amber-500',
    markerNumber: 4,
    tile: 1,
    balance: STARTING_MONEY,
    hasPaidKos: false,
    lapCompleted: false,
    isFinished: false,
    totalRezeki: 0,
    totalPengeluaran: 0,
    isTurn: false,
  },
  {
    id: 'p5',
    name: 'Player 5',
    color: '#9333ea', // Ungu
    badgeBg: 'bg-purple-600',
    markerNumber: 5,
    tile: 1,
    balance: STARTING_MONEY,
    hasPaidKos: false,
    lapCompleted: false,
    isFinished: false,
    totalRezeki: 0,
    totalPengeluaran: 0,
    isTurn: false,
  },
];
