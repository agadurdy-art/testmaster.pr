// Chart renderers (bar / pie / line) — verbatim from pages/VisualGenerator.js
// lines 1285-1614 (Faz1 wave 10). Pure (ctx, data) canvas renderers.
  // ============ BAR CHART RENDERER ============
export const renderBarChart = (ctx, data) => {
    const w = data.width;
    const h = data.height;
    const padding = { top: 80, right: 40, bottom: 80, left: 70 };

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.title, w/2, 30);
    if (data.subtitle) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(data.subtitle, w/2, 48);
    }

    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const categories = data.categories || [];
    const series = data.series || [];
    const yMax = data.yMax || Math.max(...series.flatMap(s => s.values));

    // Grid
    if (data.showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + chartH - (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
      }
    }

    // Axes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#1f2937';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartH - (chartH / 5) * i;
      const value = Math.round((yMax / 5) * i);
      ctx.fillText(value.toString(), padding.left - 8, y + 4);
    }

    // Bars
    const groupWidth = chartW / categories.length;
    const barWidth = (groupWidth - 20) / series.length;

    categories.forEach((cat, catIdx) => {
      const groupX = padding.left + catIdx * groupWidth + 10;
      
      series.forEach((s, serIdx) => {
        const barX = groupX + serIdx * barWidth;
        const barH = (s.values[catIdx] / yMax) * chartH;
        const barY = h - padding.bottom - barH;
        
        ctx.fillStyle = s.color;
        ctx.fillRect(barX, barY, barWidth - 4, barH);
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth - 4, barH);
      });
      
      // X-axis label
      ctx.fillStyle = '#1f2937';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(cat, groupX + (groupWidth - 20) / 2, h - padding.bottom + 20);
    });

    // Legend
    if (data.showLegend) {
      const legendX = w - padding.right - 120;
      const legendY = padding.top;
      
      series.forEach((s, idx) => {
        ctx.fillStyle = s.color;
        ctx.fillRect(legendX, legendY + idx * 20, 15, 12);
        ctx.fillStyle = '#1f2937';
        ctx.font = '11px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(s.name, legendX + 20, legendY + idx * 20 + 10);
      });
    }

    // Axis labels
    if (data.xLabel) {
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.xLabel, w/2, h - 15);
    }
    if (data.yLabel) {
      ctx.save();
      ctx.translate(18, h/2);
      ctx.rotate(-Math.PI/2);
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.yLabel, 0, 0);
      ctx.restore();
    }
};

  // ============ PIE CHART RENDERER ============
export const renderPieChart = (ctx, data) => {
    const w = data.width;
    const h = data.height;
    const centerX = w / 2 - 60;
    const centerY = h / 2 + 20;
    const radius = Math.min(w, h) / 3;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.title, w/2, 30);
    if (data.subtitle) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(data.subtitle, w/2, 48);
    }

    const total = data.data.reduce((sum, d) => sum + d.value, 0);
    let startAngle = -Math.PI / 2;

    data.data.forEach((slice, idx) => {
      const sliceAngle = (slice.value / total) * Math.PI * 2;
      
      ctx.fillStyle = slice.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Percentage label
      if (data.showPercentages) {
        const midAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(midAngle) * labelRadius;
        const labelY = centerY + Math.sin(midAngle) * labelRadius;
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${slice.value}%`, labelX, labelY);
      }

      startAngle += sliceAngle;
    });

    // Legend
    if (data.showLegend) {
      const legendX = w - 150;
      const legendY = 80;
      
      data.data.forEach((slice, idx) => {
        ctx.fillStyle = slice.color;
        ctx.fillRect(legendX, legendY + idx * 25, 18, 18);
        ctx.fillStyle = '#1f2937';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${slice.label} (${slice.value}%)`, legendX + 25, legendY + idx * 25 + 14);
      });
    }
};

  // ============ LINE GRAPH RENDERER ============
export const renderLineGraph = (ctx, data) => {
    const w = data.width;
    const h = data.height;
    const padding = { top: 80, right: 40, bottom: 60, left: 60 };

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.title, w/2, 30);
    if (data.subtitle) {
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(data.subtitle, w/2, 48);
    }

    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const xLabels = data.xLabels || [];
    const series = data.series || [];
    const yMin = data.yMin || 0;
    const yMax = data.yMax || Math.max(...series.flatMap(s => s.values));
    const yRange = yMax - yMin;

    // Grid
    if (data.showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + chartH - (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(w - padding.right, y);
        ctx.stroke();
      }
      for (let i = 0; i < xLabels.length; i++) {
        const x = padding.left + (chartW / (xLabels.length - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, h - padding.bottom);
        ctx.stroke();
      }
    }

    // Axes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#1f2937';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartH - (chartH / 5) * i;
      const value = (yMin + (yRange / 5) * i).toFixed(1);
      ctx.fillText(value, padding.left - 8, y + 4);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    xLabels.forEach((label, idx) => {
      const x = padding.left + (chartW / (xLabels.length - 1)) * idx;
      ctx.fillText(label, x, h - padding.bottom + 18);
    });

    // Lines
    series.forEach(s => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      s.values.forEach((val, idx) => {
        const x = padding.left + (chartW / (xLabels.length - 1)) * idx;
        const y = padding.top + chartH - ((val - yMin) / yRange) * chartH;
        
        if (idx === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Points
      if (data.showPoints) {
        s.values.forEach((val, idx) => {
          const x = padding.left + (chartW / (xLabels.length - 1)) * idx;
          const y = padding.top + chartH - ((val - yMin) / yRange) * chartH;
          
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });

    // Legend
    const legendX = w - 100;
    const legendY = padding.top;
    series.forEach((s, idx) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY + idx * 20 + 6);
      ctx.lineTo(legendX + 20, legendY + idx * 20 + 6);
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(s.name, legendX + 25, legendY + idx * 20 + 10);
    });

    // Axis labels
    if (data.xLabel) {
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.xLabel, w/2, h - 10);
    }
    if (data.yLabel) {
      ctx.save();
      ctx.translate(15, h/2);
      ctx.rotate(-Math.PI/2);
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.yLabel, 0, 0);
      ctx.restore();
    }
};
