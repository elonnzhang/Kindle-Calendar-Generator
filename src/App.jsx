import React, { useState } from 'react';
import CalendarPreview from './components/CalendarPreview';
import CalendarForm, { DEVICE_PRESETS } from './components/CalendarForm';
import { generateCalendarSVG } from './lib/calendarGenerator.js';
import { buildCalendarEpub, epubFilename } from './lib/epub.js';
import './App.css';

async function coverPng(year, month, width, height, orientation) {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateCalendarSVG(year, month, width, height, orientation))}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(img, 0, 0, width, height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}

async function downloadEpub(year, month, width, height, orientation) {
  const cover = await coverPng(year, month, width, height, orientation);
  const blob = new Blob([buildCalendarEpub(year, month, cover, orientation)], { type: 'application/epub+zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = epubFilename(year, month, orientation);
  a.click();
  URL.revokeObjectURL(url);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [size, setSize] = useState({ width: DEVICE_PRESETS[0].width, height: DEVICE_PRESETS[0].height, preset: DEVICE_PRESETS[0] });
  const [orientation, setOrientation] = useState('portrait');
  const [status, setStatus] = useState({ kind: 'idle' });

  const handleGenerate = async ({ allMonths }) => {
    const months = allMonths ? Array.from({ length: 12 }, (_, i) => i + 1) : [month];
    try {
      for (const [i, m] of months.entries()) {
        setStatus({ kind: 'working', done: i, total: months.length });
        if (i > 0) await sleep(500);
        await downloadEpub(year, m, size.width, size.height, orientation);
      }
      setStatus({
        kind: 'done',
        message: allMonths ? `已下载 ${year} 年全部 12 本` : `已下载 ${epubFilename(year, month, orientation)}`,
      });
    } catch (error) {
      setStatus({ kind: 'error', message: `生成失败：${error.message}` });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kindle 日历生成器</h1>
        <p>生成以月历为封面的 EPUB。传到 Kindle 后，待机画面会显示这个月的日历。</p>
      </header>

      <main className="app-content">
        <CalendarForm
          year={year}
          month={month}
          size={size}
          orientation={orientation}
          status={status}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onSizeChange={setSize}
          onOrientationChange={setOrientation}
          onGenerate={handleGenerate}
        />
        <CalendarPreview year={year} month={month} size={size} orientation={orientation} />
      </main>
    </div>
  );
}

export default App;
