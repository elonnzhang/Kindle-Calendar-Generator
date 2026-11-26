# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**kindle-calendar**
生成一本 epub 电子书，封面是每个月的日历，内容是空的。
背景：kindle 在待机时会显示封面，所以如果电子书的封面是每个月的日历，就可以在待机时查看每个月的日历。
目的：是为了方便在 kindle 上查看每个月的日历。

## Technology Stack

- **Frontend**: React + Vite
- **Backend/CLI**: Node.js (ES Modules)
- **Image Generation**: Pure JavaScript SVG generation, rasterized to a PNG cover (no native dependencies)
- **EPUB Generation**: fflate, shared by the CLI and the web app

## Architecture

The project has two main interfaces:

### 1. Web Interface (React)
- **src/App.jsx** - Main application component; downloads EPUBs built by `src/lib/epub.js`
- **src/components/CalendarForm.jsx** - Form for calendar settings (year, month, device preset, dimensions)
- **src/components/CalendarPreview.jsx** - Real-time canvas preview of calendar

### 2. CLI Tool (Node.js)
- **src/cli.js** - Command-line interface for batch generation
- **src/lib/calendarGenerator.js** - Calendar SVG generation (pure JavaScript, no native dependencies)
- **src/lib/epub.js** - `buildCalendarEpub()` returns the EPUB as a `Uint8Array`; used by both the CLI and the web app

### Key Implementation Details

- **No Native Dependencies**: Uses SVG for calendar rendering instead of node-canvas to avoid compilation issues across different Node.js versions
- **PNG Cover**: Amazon's Kindle pipeline drops SVG covers, so the EPUB cover is `OEBPS/cover.png`. The CLI rasterizes the SVG with `@resvg/resvg-wasm`; the web app draws it on a canvas
- **EPUB Structure**: Manually creates EPUB structure (ZIP with `mimetype` first and stored, META-INF, OEBPS)
- **Chinese Calendar**: Weekdays in Chinese (一到日)
- **No Date Highlighting**: The current day is not highlighted. Saturday and Sunday are printed in grey
- **Text as Paths**: The cover draws every character as a glyph outline from `src/lib/glyphs.js` (Bodoni Moda and Noto Serif SC, OFL), because a Kindle has none of these fonts. Run `npm run glyphs` to regenerate it after you change a font or add a character to `scripts/build-glyphs.mjs`
- **Landscape**: A Kindle always shows the cover in portrait, so `--width`/`--height` stay the portrait screen size. A landscape cover is laid out at height × width and drawn rotated −90°, so it reads upright with the bottom edge on the left. The preview turns the device 90° clockwise to match
- **Kindle Optimized**: Default 1072×1448 resolution for Kindle Paperwhite, configurable for other devices
- **Same Output**: The web app and the CLI produce EPUBs with the same entries. Only the PNG bytes differ, because each uses its own rasterizer

## Project Structure

```
kindle-calendar/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main React component
│   ├── components/           # React components
│   │   ├── CalendarForm.jsx
│   │   └── CalendarPreview.jsx
│   ├── lib/                  # Core logic
│   │   ├── calendarGenerator.js
│   │   ├── glyphs.js         # Generated glyph outlines
│   │   └── epub.js
│   └── cli.js                # CLI tool
├── .github/workflows/monthly-calendar.yml  # Monthly release of both EPUBs
├── scripts/build-glyphs.mjs  # Regenerates src/lib/glyphs.js
├── index.html                # HTML entry
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Development Commands

### Setup
```bash
# Install dependencies
npm install
```

### Web Interface
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### CLI Generation
```bash
# Generate current month
npm run generate

# Generate specific month
npm run generate -- --month 3 --year 2026

# Generate all 12 months
npm run generate -- --all --year 2027

# Custom output directory
npm run generate -- --output my_calendars/

# Custom dimensions (e.g., for Kindle Oasis)
npm run generate -- --width 1264 --height 1680

# Landscape, for a Kindle held sideways with its bottom edge on the left
npm run generate -- --landscape
```

### Output
- EPUB files are saved to `output/` directory by default
- Files are named: `calendar_YYYY_MM_V.epub` (portrait) or `calendar_YYYY_MM_H.epub` (landscape)
- Transfer EPUB files with Send to Kindle (email or the web page). A Kindle does not open EPUB files copied over USB

## Kindle Device Resolutions

The default resolution (1072×1448) is optimized for Kindle Paperwhite. For other devices:
- Kindle Paperwhite: 1072×1448 (default)
- Kindle Oasis: 1264×1680
- Kindle Basic: 800×1280
- Kindle Voyage: 1072×1448

Use `--width` and `--height` arguments to customize for your device.
