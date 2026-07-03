// renderFloorPlan — verbatim from pages/VisualGenerator.js lines 774-937 (Faz1 wave 10).
// Pure (ctx, data) canvas renderer — closes over nothing from the component.
  // ============ FLOOR PLAN RENDERER ============
export const renderFloorPlan = (ctx, data) => {
    const w = data.width;
    const h = data.height;

    // Background
    ctx.fillStyle = '#fafaf5';
    ctx.fillRect(0, 0, w, h);

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.title, w/2, 30);
    if (data.subtitle) {
      ctx.font = '13px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(data.subtitle, w/2, 48);
    }

    // Corridors
    data.corridors?.forEach(corridor => {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(corridor.x, corridor.y, corridor.width, corridor.height);
    });

    // Given rooms
    data.givenRooms?.forEach(room => {
      if (room.style === 'entrance') {
        ctx.fillStyle = '#bbf7d0';
      } else if (room.style === 'info') {
        ctx.fillStyle = '#bfdbfe';
      } else {
        ctx.fillStyle = '#f3f4f6';
      }
      ctx.fillRect(room.x, room.y, room.width, room.height);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.strokeRect(room.x, room.y, room.width, room.height);
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(room.name, room.x + room.width/2, room.y + room.height/2 + 4);
    });

    // Rooms to label
    data.rooms?.forEach(room => {
      ctx.fillStyle = room.unlabeled ? '#fef3c7' : '#f9fafb';
      ctx.fillRect(room.x, room.y, room.width, room.height);
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.strokeRect(room.x, room.y, room.width, room.height);

      // Door
      if (room.door) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        const doorSize = Math.min(room.width, room.height) / 3;
        switch (room.door) {
          case 'top':
            ctx.beginPath();
            ctx.moveTo(room.x + room.width/2 - doorSize, room.y);
            ctx.lineTo(room.x + room.width/2 + doorSize, room.y);
            ctx.stroke();
            break;
          case 'bottom':
            ctx.beginPath();
            ctx.moveTo(room.x + room.width/2 - doorSize, room.y + room.height);
            ctx.lineTo(room.x + room.width/2 + doorSize, room.y + room.height);
            ctx.stroke();
            break;
          case 'left':
            ctx.beginPath();
            ctx.moveTo(room.x, room.y + room.height/2 - doorSize);
            ctx.lineTo(room.x, room.y + room.height/2 + doorSize);
            ctx.stroke();
            break;
          case 'right':
            ctx.beginPath();
            ctx.moveTo(room.x + room.width, room.y + room.height/2 - doorSize);
            ctx.lineTo(room.x + room.width, room.y + room.height/2 + doorSize);
            ctx.stroke();
            break;
        }
      }

      // Label
      if (room.unlabeled) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(room.x + room.width/2, room.y + room.height/2, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.id, room.x + room.width/2, room.y + room.height/2);
      }
    });

    // Features
    data.features?.forEach(feat => {
      switch (feat.type) {
        case 'fountain':
          ctx.fillStyle = '#93c5fd';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(feat.x, feat.y, feat.size || 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#1f2937';
          ctx.font = '9px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Fountain', feat.x, feat.y + (feat.size || 25) + 12);
          break;
        case 'escalator':
          ctx.fillStyle = '#ddd6fe';
          ctx.fillRect(feat.x, feat.y, 40, 60);
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth = 2;
          ctx.strokeRect(feat.x, feat.y, 40, 60);
          ctx.fillStyle = '#1f2937';
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Escalator', feat.x + 20, feat.y + 35);
          ctx.fillText(feat.direction === 'up' ? '↑' : '↓', feat.x + 20, feat.y + 50);
          break;
        case 'lift':
          ctx.fillStyle = '#d1d5db';
          ctx.fillRect(feat.x, feat.y, 35, 35);
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 2;
          ctx.strokeRect(feat.x, feat.y, 35, 35);
          ctx.fillStyle = '#1f2937';
          ctx.font = '9px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Lift', feat.x + 17, feat.y + 22);
          break;
        case 'toilets':
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(feat.x, feat.y, 50, 40);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.strokeRect(feat.x, feat.y, 50, 40);
          ctx.fillStyle = '#1f2937';
          ctx.font = '9px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('WC', feat.x + 25, feat.y + 25);
          break;
      }
    });

    // Benches
    data.benches?.forEach(bench => {
      ctx.fillStyle = '#a16207';
      ctx.fillRect(bench.x - 15, bench.y - 5, 30, 10);
    });
};
