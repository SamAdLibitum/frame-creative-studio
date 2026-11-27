# FRAME — Modular Local-First Creative Studio

**FRAME** adalah aplikasi web *Creative Studio* yang bersifat modular, deterministik, dan *local-first* untuk merancang Instagram Story, mengolah foto, menyusun poster, kolase, moodboard, serta carousel multi-slide — sepenuhnya di browser tanpa AI runtime dan tanpa API eksternal.

**FRAME** is a modular, deterministic, local-first web Creative Studio for designing Instagram Stories, darkroom photo editing, posters, collages, moodboards, and multi-slide carousels — running 100% locally in the browser with zero AI runtime dependencies and zero external APIs.

---

## Creative Workspaces

Seluruh ruang kerja berbagi satu fondasi editor, sistem layer, history, rendering, penyimpanan IndexedDB, dan export engine yang sama:

1. **Story Studio (`9:16` · 1080×1920)** — Desain Story vertikal dengan foto, tipografi, filter, dan *optical overlay*.
2. **Photo Darkroom (`4:5` · 1080×1350)** — Pengolahan foto non-destruktif: crop, adjustments, 10 preset filter, dan *Hold-to-Compare*.
3. **Poster & Graphic Studio (`A4` · 1240×1754)** — Tipografi editorial, *procedural graphics*, dan Swiss hairline grid.
4. **Collage Studio (`1:1` · 1080×1080)** — Komposisi multi-foto (1–6 foto) berbasis *Smart Layout Engine*.
5. **Moodboard Studio (`16:9` · 1920×1080)** — Kanvas lebar untuk eksplorasi warna, referensi visual, dan komposisi bebas.
6. **Carousel Studio (`4:5` · Multi-Slide)** — Manajemen banyak slide dalam satu proyek dengan tema global, overview grid, dan ekspor berurutan.

---

## Fitur Utama / Key Features (M1–M8)

- **Universal Canvas (`formatEngine.ts`):** Preset `9:16`, `1:1`, `4:5`, `16:9`, `A4`, dan ukuran `Custom` dengan adaptasi elemen otomatis (`adaptElementsToCanvasSize`).
- **Photo Editing Engine:** Upload lokal dengan validasi MIME + *magic bytes* (JPEG/PNG/WebP), *non-destructive crop & pan*, 7 bentuk *Frame Masking* (Rectangle, Rounded, Circle, Oval, Arch, Polaroid, Custom Ratio), 10 preset filter + 10 detail *adjustments* dengan fallback `ImageData` lintas browser, serta tombol **Bandingkan Asli** (*Hold-to-Compare*).
- **Smart Layout Engine:** 18 komposisi rule-based untuk 1–6 foto dengan rekomendasi orientasi otomatis (*Portrait / Landscape / Square*) dan kontrol *spacing*, *margin*, serta *corner radius*.
- **Procedural Creative Engine (`src/engines/procedural/`):** 8 generator deterministik berbasis Mulberry32 (*Mesh Gradient*, *Organic Blobs*, *Layered Waves*, *Geometric Grid*, *Halftone Dots*, *Starfield*, *Light Leak*, *Bokeh Glow*), 10 palet film editorial, *palette extractor* dari foto, *blend mode* (`screen`, `overlay`, `soft-light`, `lighten`), *seamless toroidal noise grain* (`source-atop`), dan *dual-limit LRU cache* (24 entri / 64 MiB).
- **Carousel Studio (`src/engines/carousel/`):** Tambah, duplikat, hapus, *drag-and-drop reorder*, tema global, 4 *starter deck* (*Educational*, *Photo Storytelling*, *Minimal Editorial*, *Promotional Showcase*), modal *Overview*, dan ekspor semua slide berurutan.
- **Deterministic Motion Engine (`src/engines/motion/`):** 5 preset animasi elemen (*Fade In*, *Slide Up*, *Float*, *Slow Zoom*, *Pulse*), *Timeline Scrubber* `0.0–5.0s` di *Preview Mode*, dan ekspor video **WebM** berbasis `canvas.captureStream(30)` + `MediaRecorder`.
- **Multi-Format Batch Export & Local-First Storage:** Ekspor PNG/JPEG resolusi penuh, *Batch Export Multi-Rasio* tanpa mengubah dokumen aktif, serta penyimpanan lokal **IndexedDB (Dexie)** dengan *autosave* 1.5 detik dan Undo/Redo (*coalescing* 320 ms).

---

## Arsitektur / Architecture

```text
src/
├── engines/
│   ├── canvas/formatEngine.ts         # Universal Canvas presets & element adaptation
│   ├── carousel/carouselEngine.ts     # Multi-slide state, themes, starter decks
│   ├── motion/motionEngine.ts         # Deterministic 0–5s motion evaluator
│   └── procedural/                    # Pure core, 10 editorial palettes, LRU Canvas2D renderer, palette extractor
├── features/
│   ├── dashboard/                     # Workspace launchers, Recent Projects, Template gallery
│   └── story-creator/                 # Unified canvas editor, StoryEditorContext, panels, Konva renderers
├── utils/
│   ├── db.ts                          # Dexie IndexedDB schema (projects + photo blobs)
│   ├── projectStorage.ts              # Safe JSON parsing, autosave, duplication
│   └── exportEngine.ts                # Full-res PNG/JPEG, Carousel export, Batch export, WebM recorder
└── types/studio.ts                    # Unified TypeScript models
```

---

## Technology Stack

- **React 19** + **TypeScript 7** + **Vite 8**
- **Tailwind CSS v4** + **Lucide React**
- **Konva** & **React Konva** (2D Scene Graph & Canvas Rendering)
- **Dexie** (IndexedDB local persistence)
- **HTML5 Canvas 2D API** & **Browser MediaRecorder API**

---

## Installation & Usage

```bash
git clone https://github.com/SamAdLibitum/frame-creative-studio.git
cd frame-creative-studio
npm install
npm run dev
```

Perintah verifikasi / Verification commands:

```bash
npm run typecheck
npm run build
```

---

## Project Status

**FRAME v1.0 (Release Candidate — Local-First Web Studio).** Seluruh fondasi M1–M8 telah terimplementasi dan lolos verifikasi TypeScript, production build, serta unit test deterministik di Node.js. Ekspor video WebM bergantung pada dukungan `MediaRecorder` & `canvas.captureStream` pada masing-masing browser; pengujian visual & interaksi lintas browser secara otomatis (E2E) direkomendasikan sebelum distribusi publik skala luas.
