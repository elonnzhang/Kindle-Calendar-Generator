import React, { useState } from 'react';
import CalendarPreview from './components/CalendarPreview';
import CalendarForm from './components/CalendarForm';
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

function App() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (options) => {
    setGenerating(true);
    try {
      if (options.month) {
        // Generate single month
        await downloadEpub(options.year, options.month, options.width, options.height);
        alert('EPUB 日历已生成！');
      } else {
        // Generate all months
        for (let month = 1; month <= 12; month++) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Delay between downloads
          await downloadEpub(options.year, month, options.width, options.height);
        }
        alert('全年 EPUB 日历已生成！');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('生成失败：' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Kindle 日历生成器</h1>
        <p>生成带有日历封面的 EPUB 电子书，在 Kindle 待机界面显示日历</p>
      </header>

      <div className="app-content">
        <div className="left-panel">
          <CalendarForm
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
            onGenerate={handleGenerate}
            generating={generating}
          />
        </div>

        <div className="right-panel">
          <CalendarPreview
            year={selectedYear}
            month={selectedMonth}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
