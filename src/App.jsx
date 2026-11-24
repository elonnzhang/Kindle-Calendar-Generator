import React, { useState } from 'react';
import CalendarPreview from './components/CalendarPreview';
import CalendarForm, { DEVICE_PRESETS } from './components/CalendarForm';
import { buildCalendarEpub, epubFilename } from './lib/epub.js';
import './App.css';

function downloadEpub(year, month, width, height) {
  const blob = new Blob([buildCalendarEpub(year, month, width, height)], { type: 'application/epub+zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = epubFilename(year, month);
  a.click();
  URL.revokeObjectURL(url);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [size, setSize] = useState({ width: DEVICE_PRESETS[0].width, height: DEVICE_PRESETS[0].height });
  const [status, setStatus] = useState({ kind: 'idle' });

  const handleGenerate = async ({ allMonths }) => {
    const months = allMonths ? Array.from({ length: 12 }, (_, i) => i + 1) : [month];
    try {
      for (const [i, m] of months.entries()) {
        setStatus({ kind: 'working', done: i, total: months.length });
        if (i > 0) await sleep(500);
        downloadEpub(year, m, size.width, size.height);
      }
      setStatus({
        kind: 'done',
        message: allMonths ? `已下载 ${year} 年全部 12 本` : `已下载 ${epubFilename(year, month)}`,
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
          status={status}
          onYearChange={setYear}
          onMonthChange={setMonth}
          onSizeChange={setSize}
          onGenerate={handleGenerate}
        />
        <CalendarPreview year={year} month={month} size={size} />
      </main>
    </div>
  );
}

export default App;
