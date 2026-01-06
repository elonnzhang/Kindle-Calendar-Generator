import React, { useState } from 'react';
import './CalendarForm.css';

const CalendarForm = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  onGenerate,
  generating,
}) => {
  const [generateAll, setGenerateAll] = useState(false);
  const [width, setWidth] = useState(1072);
  const [height, setHeight] = useState(1448);
  const [selectedPreset, setSelectedPreset] = useState('Kindle Paperwhite'); // Track selected preset name

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const devicePresets = [
    { name: 'Kindle Paperwhite', width: 1072, height: 1448 },
    { name: 'Kindle Oasis', width: 1264, height: 1680 },
    { name: 'Kindle Basic', width: 800, height: 1280 },
    { name: 'Kindle Voyage', width: 1072, height: 1448 },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({
      year: selectedYear,
      month: generateAll ? null : selectedMonth,
      width,
      height,
    });
  };

  const applyPreset = (preset) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setSelectedPreset(preset.name); // Remember which preset was clicked
  };

  // Check if this specific preset is selected
  const isPresetSelected = (preset) => {
    return selectedPreset === preset.name;
  };

  return (
    <form className="calendar-form" onSubmit={handleSubmit}>
      <h2>⚙️ 生成设置</h2>

      <div className="form-group">
        <label>选择年份</label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year} 年
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={generateAll}
            onChange={(e) => setGenerateAll(e.target.checked)}
          />
          生成全年 12 个月
        </label>
      </div>

      {!generateAll && (
        <div className="form-group">
          <label>选择月份</label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month} 月
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Kindle 设备预设</label>
        <div className="preset-buttons">
          {devicePresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              className={`preset-btn ${isPresetSelected(preset) ? 'preset-btn-active' : ''}`}
              onClick={() => applyPreset(preset)}
            >
              {preset.name}
              {isPresetSelected(preset) && ' ✓'}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>图像宽度 (px)</label>
        <input
          type="number"
          value={width}
          onChange={(e) => {
            setWidth(parseInt(e.target.value));
            setSelectedPreset(null); // Clear preset selection when manually changing
          }}
          min="600"
          max="2000"
        />
      </div>

      <div className="form-group">
        <label>图像高度 (px)</label>
        <input
          type="number"
          value={height}
          onChange={(e) => {
            setHeight(parseInt(e.target.value));
            setSelectedPreset(null); // Clear preset selection when manually changing
          }}
          min="800"
          max="3000"
        />
      </div>

      <button type="submit" className="generate-btn" disabled={generating}>
        {generating ? '生成中...' : '🚀 生成 EPUB'}
      </button>
    </form>
  );
};

export default CalendarForm;
