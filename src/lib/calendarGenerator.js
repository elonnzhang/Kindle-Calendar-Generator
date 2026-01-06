/**
 * Calendar SVG generator for Kindle display.
 * Generates calendar SVG images suitable for Kindle e-reader covers.
 */

/**
 * Generate a calendar SVG for a specific month.
 * @param {number} year - Year (e.g., 2024)
 * @param {number} month - Month (1-12)
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {string} SVG string containing the calendar
 */
export function generateCalendarSVG(year, month, width = 1072, height = 1448) {
  const weekdays = ['一', '二', '三', '四', '五', '六', '日'];

  // Get calendar data
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0

  // Calculate grid
  const cal = [];
  let day = 1;
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if ((week === 0 && dayOfWeek < adjustedFirstDay) || day > daysInMonth) {
        weekDays.push(0);
      } else {
        weekDays.push(day++);
      }
    }
    cal.push(weekDays);
    if (day > daysInMonth) break;
  }

  // Style and layout
  const cellWidth = width / 7;
  const cellHeight = 140;
  const headerY = 300;
  const gridStartY = headerY + 120;

  // Generate SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="white"/>

  <!-- Title -->
  <text x="${width / 2}" y="150"
        font-family="Arial, sans-serif"
        font-size="120"
        font-weight="bold"
        text-anchor="middle"
        fill="black">${year}年 ${month}月</text>

  <!-- Weekday headers -->`;

  weekdays.forEach((day, i) => {
    const x = i * cellWidth + cellWidth / 2;
    svg += `
  <text x="${x}" y="${headerY}"
        font-family="Arial, sans-serif"
        font-size="60"
        text-anchor="middle"
        fill="black">${day}</text>`;
  });

  svg += `

  <!-- Calendar grid -->`;

  cal.forEach((week, weekNum) => {
    week.forEach((day, dayNum) => {
      if (day === 0) return;

      const x = dayNum * cellWidth + cellWidth / 2;
      const y = gridStartY + weekNum * cellHeight + 30;

      svg += `
  <text x="${x}" y="${y + 17}"
        font-family="Arial, sans-serif"
        font-size="50"
        text-anchor="middle"
        fill="black">${day}</text>`;
    });
  });

  svg += `
</svg>`;

  return svg;
}
