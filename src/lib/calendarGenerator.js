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

// A horizontal rule from x0 to x1, w pixels thick at scale 1.
const rule = (x0, x1, y, s, w = 1.5) =>
  `<rect x="${fmt(x0)}" y="${fmt(y - (w * s) / 2)}" width="${fmt(x1 - x0)}" height="${fmt(w * s)}" fill="${RULE}"/>`;

// English month and year, then a rule. Returns the rule's y.
function masthead(parts, year, month, left, right, top, s) {
  const y = top + 26 * s;
  parts.push(text('caps', MONTHS_EN[month - 1], left, y, 30 * s, { tracking: 0.32 }));
  parts.push(text('numeral', String(year), right, y, 30 * s, { anchor: 'end', tracking: 0.14 }));
  parts.push(rule(left, right, y + 28 * s, s));
  return y + 28 * s;
}

// Large month numeral with its cap height starting at top. Returns its baseline.
function monthNumeral(parts, month, left, top, s) {
  const base = top + 300 * s;
  const size = (300 * s * FONTS.display.em) / FONTS.display.height;
  parts.push(text('display', String(month), left - 6 * s, base, size));
  return base;
}

// Weekday header centred on weekY, then the day grid down to bottom.
function dayGrid(parts, year, month, left, right, weekY, bottom, s) {
  const colW = (right - left) / 7;
  WEEKDAYS.forEach((d, i) => {
    parts.push(
      text('cjkBold', d, left + colW * (i + 0.5), centred('cjkBold', weekY, 32 * s), 32 * s, {
        anchor: 'middle',
        fill: i >= 5 ? WEEKEND : INK,
      }),
    );
  });
  const gridTop = weekY + 40 * s;
  parts.push(rule(left, right, gridTop, s));

  // Rows share the height between the header and the bottom rule.
  const weeks = monthGrid(year, month);
  const rowH = (bottom - gridTop) / weeks.length;
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
    if (r < weeks.length - 1) parts.push(rule(left, right, gridTop + rowH * (r + 1), s, 1));
  });
  parts.push(rule(left, right, bottom, s));
}

// Portrait: numeral above a full-width grid. Designed at 1072 × 1448.
function portrait(year, month, width, height) {
  const s = Math.min(width / 1072, height / 1448);
  const margin = 72 * s;
  const left = margin;
  const right = width - margin;
  const parts = [];
  const mastRule = masthead(parts, year, month, left, right, margin, s);
  const numeralBase = monthNumeral(parts, month, left, mastRule + 64 * s, s);
  parts.push(text('cjkBold', MONTHS_ZH[month - 1], right, numeralBase, 64 * s, { anchor: 'end', tracking: 0.08 }));
  dayGrid(parts, year, month, left, right, numeralBase + 96 * s, height - margin, s);
  return parts;
}

// Landscape: numeral on the left, grid on the right. Designed at 1448 × 1072.
function landscape(year, month, width, height) {
  const s = Math.min(width / 1448, height / 1072);
  const margin = 72 * s;
  const left = margin;
  const right = width - margin;
  const bottom = height - margin;
  const gridLeft = left + 520 * s;
  const parts = [];
  const contentTop = masthead(parts, year, month, left, right, margin, s) + 64 * s;
  monthNumeral(parts, month, left, contentTop, s);
  parts.push(text('cjkBold', MONTHS_ZH[month - 1], left, bottom, 64 * s, { tracking: 0.08 }));
  dayGrid(parts, year, month, gridLeft, right, contentTop + 16 * s, bottom, s);
  return parts;
}

/**
 * Calendar cover for one month, as an SVG string.
 *
 * width and height are the screen in portrait, because a Kindle always shows
 * its cover in portrait. A landscape cover is laid out on the turned screen
 * and drawn rotated, so it reads upright when the Kindle is held with its
 * bottom edge on the left.
 * @param {number} year
 * @param {number} month 1-12
 * @param {number} width pixels
 * @param {number} height pixels
 * @param {'portrait' | 'landscape'} orientation
 */
export function generateCalendarSVG(year, month, width = 1072, height = 1448, orientation = 'portrait') {
  const body =
    orientation === 'landscape'
      ? `<g transform="translate(0 ${height}) rotate(-90)">\n${landscape(year, month, height, width).join('\n')}\n</g>`
      : portrait(year, month, width, height).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
<rect width="${width}" height="${height}" fill="#ffffff"/>
${body}
</svg>`;
}
