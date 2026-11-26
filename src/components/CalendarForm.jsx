import React, { useState } from 'react';
import './CalendarForm.css';

export const DEVICE_PRESETS = [
  { name: 'Kindle Paperwhite', frame: 'paperwhite', width: 1072, height: 1448 },
  { name: 'Kindle Oasis', frame: 'oasis', width: 1264, height: 1680 },
  { name: 'Kindle Basic', frame: 'basic', width: 800, height: 1280 },
  { name: 'Kindle Voyage', frame: 'voyage', width: 1072, height: 1448 },
];

const ORIENTATIONS = [
  { value: 'portrait', name: '竖屏', hint: '正常拿着' },
  { value: 'landscape', name: '横屏', hint: '底边朝左' },
];

const LIMITS = { width: [600, 2000], height: [800, 3000] };

const parseSize = (key, text) => {
  const n = Number(text);
  const [min, max] = LIMITS[key];
  return text !== '' && Number.isInteger(n) && n >= min && n <= max ? n : null;
};

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => currentYear + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function Select({ id, value, onChange, disabled, children }) {
  return (
    <div className="select">
      <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))}>
        {children}
      </select>
      <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function CalendarForm({
  year,
  month,
  size,
  orientation,
  status,
  onYearChange,
  onMonthChange,
  onSizeChange,
  onOrientationChange,
  onGenerate,
}) {
  const [allMonths, setAllMonths] = useState(false);
  const [draft, setDraft] = useState({ width: String(size.width), height: String(size.height) });

  const parsed = { width: parseSize('width', draft.width), height: parseSize('height', draft.height) };
  const sizeValid = parsed.width !== null && parsed.height !== null;
  const working = status.kind === 'working';

  const applyPreset = (p) => {
    setDraft({ width: String(p.width), height: String(p.height) });
    onSizeChange({ width: p.width, height: p.height, preset: p });
  };

  const editSize = (key, text) => {
    const next = { ...draft, [key]: text };
    setDraft(next);
    const width = parseSize('width', next.width);
    const height = parseSize('height', next.height);
    onSizeChange(width !== null && height !== null ? { width, height, preset: null } : { ...size, preset: null });
  };

  const submit = (e) => {
    e.preventDefault();
    if (sizeValid && !working) onGenerate({ allMonths });
  };

  return (
    <form className="card" onSubmit={submit} noValidate>
      <div className="card-header">
        <h2>生成设置</h2>
        <p>选择月份和设备，下载对应的 EPUB。</p>
      </div>

      <div className="card-body">
        <div className="field-row">
          <div className="field">
            <label htmlFor="year">年份</label>
            <Select id="year" value={year} onChange={onYearChange}>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y} 年</option>
              ))}
            </Select>
          </div>
          <div className="field">
            <label htmlFor="month">月份</label>
            <Select id="month" value={month} onChange={onMonthChange} disabled={allMonths}>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m} 月</option>
              ))}
            </Select>
          </div>
        </div>

        <label className="switch-row">
          <span>
            <span className="switch-title">生成全年 12 个月</span>
            <span className="hint">每个月一本，依次下载</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            checked={allMonths}
            onChange={(e) => setAllMonths(e.target.checked)}
          />
        </label>

        <div className="separator" />

        <fieldset className="field">
          <legend>设备</legend>
          <div className="presets">
            {DEVICE_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className="preset"
                aria-pressed={size.preset === p}
                onClick={() => applyPreset(p)}
              >
                <span className="preset-name">{p.name.replace('Kindle ', '')}</span>
                <span className="preset-size">{p.width} × {p.height}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>方向</legend>
          <div className="presets">
            {ORIENTATIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                className="preset"
                aria-pressed={orientation === o.value}
                onClick={() => onOrientationChange(o.value)}
              >
                <span className="preset-name">{o.name}</span>
                <span className="preset-size">{o.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="field-row">
          {['width', 'height'].map((key) => (
            <div className="field" key={key}>
              <label htmlFor={key}>{key === 'width' ? '宽度' : '高度'}</label>
              <div className="input-suffix">
                <input
                  id={key}
                  type="number"
                  inputMode="numeric"
                  className="input"
                  value={draft[key]}
                  min={LIMITS[key][0]}
                  max={LIMITS[key][1]}
                  aria-invalid={parsed[key] === null}
                  aria-describedby={`${key}-hint`}
                  onChange={(e) => editSize(key, e.target.value)}
                />
                <span aria-hidden="true">px</span>
              </div>
              <span id={`${key}-hint`} className={parsed[key] === null ? 'hint hint-error' : 'hint'}>
                {LIMITS[key][0]} 到 {LIMITS[key][1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <button type="submit" className="button" disabled={!sizeValid || working}>
          {working
            ? status.total > 1 ? `正在下载 ${status.done + 1} / ${status.total}` : '正在生成'
            : allMonths ? `下载 ${year} 年全部 EPUB` : `下载 ${year} 年 ${month} 月 EPUB`}
        </button>
        <p className={`status status-${status.kind}`} role="status" aria-live="polite">
          {status.kind === 'done' || status.kind === 'error' ? status.message : ' '}
        </p>
      </div>
    </form>
  );
}

export default CalendarForm;
