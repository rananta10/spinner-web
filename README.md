# Budget Spinner 🎰

Aplikasi web interaktif untuk mengacak kombinasi belanja yang pas di budget.

## Struktur Folder

```
budget-spinner/
├── index.html          ← Halaman utama (entry point)
├── css/
│   └── style.css       ← Semua styling & animasi
├── js/
│   ├── items.js        ← Manajemen daftar item (tambah, hapus, update)
│   ├── engine.js       ← Algoritma kombinasi & logika budget
│   ├── spinner.js      ← Animasi drum spinner
│   └── app.js          ← Controller utama & state aplikasi
└── README.md           ← Dokumentasi ini
```

## Cara Pakai

1. Buka `index.html` di browser (langsung klik 2x, tidak perlu server).
2. Isi daftar item beserta harganya.
3. Set total budget dan jumlah spin yang diinginkan.
4. Klik **Spin sekarang!** dan lihat hasilnya!

## Fitur

- ✅ Input item dinamis (tambah & hapus bebas)
- ✅ Konfigurasi budget, jumlah spin, dan item per spin
- ✅ Animasi drum spinner yang smooth
- ✅ Prioritas kombinasi yang **pas persis** di budget
- ✅ Fallback ke kombinasi **paling mendekati** jika tidak ada yang tepat
- ✅ Hasil berbeda di setiap spin (anti-duplikasi)
- ✅ Salin semua hasil ke clipboard
- ✅ Responsive (mobile & desktop)

## Cara Kerja Algoritma

1. **Exact match**: Program mencari kombinasi N item yang totalnya sama persis dengan budget.
2. **Closest match** (fallback): Jika tidak ada yang tepat, dicari kombinasi dengan selisih terkecil dari budget.
3. **Anti-duplikasi**: Setiap spin diusahakan menghasilkan kombinasi yang berbeda dari sebelumnya.

## Teknologi

- HTML5, CSS3, Vanilla JavaScript (ES6+)
- Google Fonts: Syne (display) + DM Sans (body)
- Tidak perlu framework atau library tambahan
- Tidak perlu koneksi internet setelah pertama kali dimuat font

## Pengembangan Lanjutan (Ideas)

- [ ] Simpan item ke localStorage agar tidak hilang saat refresh
- [ ] Export hasil ke PDF/gambar
- [ ] Mode gelap (dark mode)
- [ ] Kategori item
- [ ] Riwayat spin sebelumnya
