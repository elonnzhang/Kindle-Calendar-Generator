import React, { useMemo } from 'react';
import { generateCalendarSVG } from '../lib/calendarGenerator.js';
import './CalendarPreview.css';

function CalendarPreview({ year, month, size }) {
  const src = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateCalendarSVG(year, month, size.width, size.height))}`,
    [year, month, size.width, size.height],
  );

  return (
    <section className="preview" aria-label="封面预览">
      <div className="device">
        <img src={src} width={size.width} height={size.height} alt={`${year} 年 ${month} 月日历封面`} />
      </div>
      <p className="preview-caption">
        封面预览，与 EPUB 内的图片相同 · {size.width} × {size.height}
      </p>
    </section>
  );
}

export default CalendarPreview;
