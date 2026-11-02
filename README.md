# Kos-Kosan Survival

Game board digital berbasis **React + Vite** yang sudah disiapkan untuk deploy ke **Vercel** dan menyimpan hasil akhir permainan ke **Supabase PostgreSQL**.

## Arsitektur

- Frontend: React 19 + Vite
- Hosting: Vercel
- Backend API: Vercel Function di `api/game-results.ts`
- Database: Supabase PostgreSQL
- Secret Supabase: hanya dibaca oleh Vercel Function, tidak pernah diekspos ke browser

## 1. Siapkan Supabase

1. Buat project baru di Supabase.
2. Buka **SQL Editor**.
3. Jalankan seluruh isi file `supabase/migrations/001_create_game_results.sql`.
4. Di **Project Settings / API Keys**, siapkan Project URL dan Secret key (`sb_secret_...`).

Jangan gunakan secret key di kode frontend dan jangan memberi nama environment variable dengan awalan `VITE_`.

## 2. Menjalankan lokal

Buat file `.env.local` dari `.env.example`:

```env
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_SECRET_KEY="sb_secret_..."
```

Lalu jalankan:

```bash
npm install
npm run typecheck
npm run dev
```

Catatan: Vite dev server sendiri tidak mengeksekusi folder `api/` sebagai Vercel Function. Untuk menguji frontend + API seperti Vercel, gunakan Vercel CLI (`vercel dev`) setelah dependency terpasang.

## 3. Deploy ke Vercel

1. Push project ini ke GitHub, GitLab, atau Bitbucket.
2. Import repository ke Vercel.
3. Framework Preset: **Vite**.
4. Tambahkan Environment Variables `SUPABASE_URL` dan `SUPABASE_SECRET_KEY`.
5. Deploy.

`vercel.json` sudah mengatur build command `npm run build`, output `dist`, dan Vercel Function di folder `api/`.

## Penyimpanan data

Saat semua pemain mencapai finish, frontend mengirim hasil akhir ke `/api/game-results`. Vercel Function memvalidasi payload kemudian menyimpan peringkat, saldo akhir, total rezeki, dan total pengeluaran ke tabel `public.game_results`.

`session_id + rank` dibuat unik agar retry request tidak menggandakan hasil permainan yang sama.

## Keamanan database

Tabel `game_results` mengaktifkan Row Level Security (RLS), lalu akses `anon` dan `authenticated` dicabut. Browser tidak mengakses tabel langsung; hanya server-side Vercel Function yang menggunakan secret key Supabase.

## Perintah

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```
