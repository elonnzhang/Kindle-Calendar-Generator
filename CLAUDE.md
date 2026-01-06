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
- **Image Generation**: Pure JavaScript SVG generation (no native dependencies)
- **EPUB Generation**: archiver (creates EPUB as ZIP with proper structure)

## Architecture

The project has two main interfaces:

### 1. Web Interface (React)
- **src/App.jsx** - Main application component
- **src/components/CalendarForm.jsx** - Form for calendar settings (year, month, device preset, dimensions)
- **src/components/CalendarPreview.jsx** - Real-time canvas preview of calendar

### 2. CLI Tool (Node.js)
- **src/cli.js** - Command-line interface for batch generation
- **src/lib/calendarGenerator.js** - Calendar SVG generation (pure JavaScript, no native dependencies)
- **src/lib/epubGenerator.js** - EPUB file generation using archiver to create proper EPUB structure

### Key Implementation Details

- **No Native Dependencies**: Uses SVG for calendar rendering instead of node-canvas to avoid compilation issues across different Node.js versions
- **EPUB Structure**: Manually creates EPUB structure (ZIP with mimetype, META-INF, OEBPS) using archiver
- **Chinese Calendar**: Weekdays in Chinese (一到日)
- **No Date Highlighting**: Calendar displays all dates uniformly without highlighting current day
- **Kindle Optimized**: Default 1072×1448 resolution for Kindle Paperwhite, configurable for other devices
- **Dual Output**: Web interface generates SVG files, CLI tool generates EPUB files

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
│   │   └── epubGenerator.js
│   └── cli.js                # CLI tool
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
```

### Output
- EPUB files are saved to `output/` directory by default
- Files are named: `calendar_YYYY_MM.epub`
- Transfer EPUB files to Kindle via USB or email

## Kindle Device Resolutions

The default resolution (1072×1448) is optimized for Kindle Paperwhite. For other devices:
- Kindle Paperwhite: 1072×1448 (default)
- Kindle Oasis: 1264×1680
- Kindle Basic: 800×1280
- Kindle Voyage: 1072×1448

Use `--width` and `--height` arguments to customize for your device.
