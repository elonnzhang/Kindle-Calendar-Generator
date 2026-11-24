import { FONTS } from './glyphs.js';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTHS_ZH = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const MONTHS_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const INK = '#000000';
const WEEKEND = '#6b6b6b';
const RULE = '#9e9e9e';

const fmt = (n) => +n.toFixed(2);

// Text is drawn as glyph outlines, so it looks the same on every device.
function text(faceName, str, x, baseline, size, { anchor = 'start', tracking = 0, fill = INK } = {}) {
  const face = FONTS[faceName];
  const k = size / face.em;
  const gap = tracking * face.em;
  const chars = [...str];
  const advance = chars.reduce((sum, ch) => sum + face.glyphs[ch].w, 0) + gap * (chars.length - 1);
  const x0 = anchor === 'middle' ? x - (advance * k) / 2 : anchor === 'end' ? x - advance * k : x;
  let pen = 0;
  const paths = chars.map((ch) => {
    const g = face.glyphs[ch];
    const p = `<path transform="translate(${pen})" d="${g.d}"/>`;
    pen += g.w + gap;
    return p;
  });
  return `<g fill="${fill}" transform="translate(${fmt(x0)} ${fmt(baseline)}) scale(${+k.toFixed(5)})">${paths.join('')}</g>`;
}

// Baseline that centres a face's reference glyph on y.
const centred = (faceName, y, size) => y + (FONTS[faceName].height * size) / FONTS[faceName].em / 2;

function monthGrid(year, month) {
  const lead = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const days = new Date(year, month, 0).getDate();
  const cells = [...Array(lead).fill(0), ...Array.from({ length: days }, (_, i) => i + 1)];
  return Array.from({ length: Math.ceil(cells.length / 7) }, (_, r) => cells.slice(r * 7, r * 7 + 7));
}

/**
 * Calendar cover for one month, as an SVG string.
 * @param {number} year
 * @param {number} month 1-12
 * @param {number} width pixels
 * @param {number} height pixels
 */
export function generateCalendarSVG(year, month, width = 1072, height = 1448) {
  const s = Math.min(width / 1072, height / 1448);
  const margin = 72 * s;
  const left = margin;
  const right = width - margin;
  const rule = (y, w = 1.5) =>
    `<rect x="${fmt(left)}" y="${fmt(y - (w * s) / 2)}" width="${fmt(right - left)}" height="${fmt(w * s)}" fill="${RULE}"/>`;

  const parts = [];

  // Masthead: English month and year, then a rule.
  const mastY = margin + 26 * s;
  parts.push(text('caps', MONTHS_EN[month - 1], left, mastY, 30 * s, { tracking: 0.32 }));
  parts.push(text('numeral', String(year), right, mastY, 30 * s, { anchor: 'end', tracking: 0.14 }));
  parts.push(rule(mastY + 28 * s));

  // Large month numeral, with the Chinese month on the same baseline.
  const numeralBase = mastY + 28 * s + 64 * s + 300 * s;
  const numeralSize = (300 * s * FONTS.display.em) / FONTS.display.height;
  parts.push(text('display', String(month), left - 6 * s, numeralBase, numeralSize));
  parts.push(text('cjkBold', MONTHS_ZH[month - 1], right, numeralBase, 64 * s, { anchor: 'end', tracking: 0.08 }));

  // Weekday header.
  const colW = (right - left) / 7;
  const weekY = numeralBase + 96 * s;
  WEEKDAYS.forEach((d, i) => {
    parts.push(
      text('cjkBold', d, left + colW * (i + 0.5), centred('cjkBold', weekY, 32 * s), 32 * s, {
        anchor: 'middle',
        fill: i >= 5 ? WEEKEND : INK,
      }),
    );
  });
  const gridTop = weekY + 40 * s;
  parts.push(rule(gridTop));

  // Day grid: rows share the height left above the bottom margin.
  const weeks = monthGrid(year, month);
  const rowH = (height - margin - gridTop) / weeks.length;
  const daySize = Math.min(64 * s, rowH * 0.5);
  weeks.forEach((week, r) => {
    const cy = gridTop + rowH * (r + 0.5);
    week.forEach((day, c) => {
      if (!day) return;
      parts.push(
        text('numeral', String(day), left + colW * (c + 0.5), centred('numeral', cy, daySize), daySize, {
          anchor: 'middle',
          fill: c >= 5 ? WEEKEND : INK,
        }),
      );
    });
    if (r < weeks.length - 1) parts.push(rule(gridTop + rowH * (r + 1), 1));
  });
  parts.push(rule(height - margin));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<rect width="${width}" height="${height}" fill="#ffffff"/>
${parts.join('\n')}
</svg>`;
}
