import React, { useMemo } from 'react';
import { generateCalendarSVG } from '../lib/calendarGenerator.js';
import './CalendarPreview.css';

// Bezel widths as fractions of the body width, measured from the published
// body sizes (mm) and front photos of each model on Wikimedia Commons.
//   Paperwhite:   177 × 128 mm (2021 and later), flush glass, thin even bezels.
//   Voyage:       162 × 115 mm, flush glass, PagePress marks on both sides.
//   Oasis 3:      159 × 141 mm, 7" flush glass, aluminium rim, grip with two buttons.
//   Kindle 2022:  158 × 109 mm, 6" screen recessed, rounded body, embossed logo.
const FRAMES = {
  paperwhite: { top: 0.083, bottom: 0.19, left: 0.083, right: 0.083, radius: 0.05, logo: true },
  voyage: { top: 0.139, bottom: 0.209, left: 0.103, right: 0.103, radius: 0.05, logo: true },
  oasis: { top: 0.057, bottom: 0.062, left: 0.046, right: 0.197, radius: 0.035, logo: false },
  basic: { top: 0.12, bottom: 0.19, left: 0.079, right: 0.079, radius: 0.085, logo: true },
};

function CalendarPreview({ year, month, size, orientation }) {
  const src = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateCalendarSVG(year, month, size.width, size.height, orientation))}`,
    [year, month, size.width, size.height, orientation],
  );

  const model = size.preset?.frame ?? 'paperwhite';
  const f = FRAMES[model];
  const screenWidth = 1 - f.left - f.right;
  const bodyHeight = f.top + screenWidth * (size.height / size.width) + f.bottom;
  const style = {
    '--body-h': bodyHeight,
    '--top': f.top,
    '--bottom': f.bottom,
    '--left': f.left,
    '--right': f.right,
    '--radius': f.radius,
  };

  const landscape = orientation === 'landscape';
  const device = (
    <div className="kindle-fit" style={style}>
      <div className={`kindle kindle-${model}`}>
        <div className="kindle-screen">
          <img src={src} width={size.width} height={size.height} alt={`${year} 年 ${month} 月日历封面`} />
        </div>
        {f.logo && <span className="kindle-logo" aria-hidden="true">kindle</span>}
        {model === 'oasis' && (
          <span className="kindle-grip" aria-hidden="true">
            <i className="dot" />
            <i className="page-key" />
            <i className="page-key" />
            <i className="dot" />
          </span>
        )}
        {model === 'voyage' &&
          ['left', 'right'].map((side) => (
            <span key={side} className={`kindle-pagepress kindle-pagepress-${side}`} aria-hidden="true">
              <i className="dot" />
              <i className="line" />
            </span>
          ))}
      </div>
    </div>
  );

  return (
    <section className="preview" aria-label="封面预览">
      {landscape ? (
        // A Kindle held with its bottom edge on the left: the device turned 90° clockwise.
        <div className="kindle-landscape" style={style}>
          {device}
        </div>
      ) : (
        device
      )}
      <p className="preview-caption">
        {size.preset ? size.preset.name : '自定义尺寸'} · {size.width} × {size.height}
        {landscape && ' · 横屏'} · 封面与 EPUB 内的图片相同
      </p>
    </section>
  );
}

export default CalendarPreview;
