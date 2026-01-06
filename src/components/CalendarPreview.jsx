import React, { useRef, useEffect } from 'react';
import './CalendarPreview.css';

const CalendarPreview = ({ year, month }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawCalendar();
    }
  }, [year, month]);

  const drawCalendar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 536; // Half of 1072
    const height = 724; // Half of 1448

    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${year}年 ${month}月`, width / 2, 80);

    // Weekday headers
    const weekdays = ['一', '二', '三', '四', '五', '六', '日'];
    ctx.font = '30px Arial';
    const cellWidth = width / 7;
    const startY = 150;

    weekdays.forEach((day, i) => {
      const x = i * cellWidth + cellWidth / 2;
      ctx.fillText(day, x, startY);
    });

    // Calendar grid
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Monday = 0

    ctx.font = '25px Arial';
    const cellHeight = 70;
    const gridStartY = startY + 40;

    let day = 1;
    for (let week = 0; week < 6 && day <= daysInMonth; week++) {
      for (let dayOfWeek = 0; dayOfWeek < 7 && day <= daysInMonth; dayOfWeek++) {
        if (week === 0 && dayOfWeek < adjustedFirstDay) {
          continue;
        }

        const x = dayOfWeek * cellWidth + cellWidth / 2;
        const y = gridStartY + week * cellHeight;

        ctx.fillText(day.toString(), x, y);
        day++;
      }
    }
  };

  return (
    <div className="calendar-preview">
      <h2>📱 预览</h2>
      <div className="preview-container">
        <canvas ref={canvasRef} />
        <p className="preview-note">
          这是 Kindle 待机界面的效果预览（缩小版）
        </p>
      </div>
    </div>
  );
};

export default CalendarPreview;
