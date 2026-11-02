# Kos-Kosan Survival

Game board digital berbasis **React + Vite**, siap deploy ke **Vercel**. Project ini tidak menggunakan database eksternal.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000/` untuk halaman pemain.

## Mode Admin

Tool developer sengaja disembunyikan dari halaman publik. Buka:

```text
http://localhost:3000/admin
```

atau setelah deploy:

```text
https://domain-anda.vercel.app/admin
```

Hanya pada `/admin` tersedia:

- Mode Kalibrasi Koordinat Petak
- Cek Aset
- Debug Kartu
- Shortcut keyboard `D` untuk membuka/tutup Debug Kartu

`/admin` adalah pemisahan antarmuka developer, **bukan autentikasi keamanan**. Jika nanti halaman admin menyimpan data sensitif, tambahkan autentikasi sebelum dipakai untuk publik.

## Deploy ke Vercel

1. Push project ke GitHub/GitLab/Bitbucket.
2. Import repository ke Vercel.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Deploy.

`vercel.json` sudah memiliki rewrite khusus agar membuka `/admin` secara langsung tetap memuat aplikasi Vite.
