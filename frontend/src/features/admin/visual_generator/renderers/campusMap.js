// renderCampusMap — verbatim from pages/VisualGenerator.js lines 358-772 (Faz1 wave 10).
// Pure (ctx, data) canvas renderer — closes over nothing from the component.
  // ============ CAMPUS MAP RENDERER ============
export const renderCampusMap = (ctx, data) => {
    const w = data.width;
    const h = data.height;

    // Background (grass/terrain)
    ctx.fillStyle = data.background || '#e8f4e8';
    ctx.fillRect(0, 0, w, h);

    // Add some texture to grass
    ctx.fillStyle = '#d4e8d4';
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw water features first (lakes, ponds)
    data.water?.forEach(water => {
      ctx.fillStyle = '#87CEEB';
      ctx.strokeStyle = '#4682B4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(water.x + water.width/2, water.y + water.height/2, water.width/2, water.height/2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Wave lines
      ctx.strokeStyle = '#6BB3D9';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(water.x + 10, water.y + water.height/2 - 10 + i * 10);
        ctx.quadraticCurveTo(water.x + water.width/2, water.y + water.height/2 - 15 + i * 10, water.x + water.width - 10, water.y + water.height/2 - 10 + i * 10);
        ctx.stroke();
      }
      
      if (water.name) {
        ctx.fillStyle = '#1e3a5f';
        ctx.font = 'italic 11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(water.name, water.x + water.width/2, water.y + water.height + 15);
      }
    });

    // Draw green areas (lawns, parks)
    data.greenAreas?.forEach(area => {
      if (area.type === 'lawn') {
        ctx.fillStyle = '#90EE90';
        ctx.strokeStyle = '#228B22';
      } else if (area.type === 'park') {
        ctx.fillStyle = '#98FB98';
        ctx.strokeStyle = '#32CD32';
      }
      ctx.lineWidth = 2;
      ctx.fillRect(area.x, area.y, area.width, area.height);
      ctx.strokeRect(area.x, area.y, area.width, area.height);
      
      if (area.name) {
        ctx.fillStyle = '#166534';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(area.name, area.x + area.width/2, area.y + area.height/2 + 4);
      }
    });

    // Draw parking areas
    data.parkingAreas?.forEach(parking => {
      ctx.fillStyle = '#d1d5db';
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = 1;
      ctx.fillRect(parking.x, parking.y, parking.width, parking.height);
      ctx.strokeRect(parking.x, parking.y, parking.width, parking.height);
      
      // Parking lines
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      for (let i = parking.x + 15; i < parking.x + parking.width; i += 15) {
        ctx.beginPath();
        ctx.moveTo(i, parking.y + 5);
        ctx.lineTo(i, parking.y + parking.height - 5);
        ctx.stroke();
      }
      
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(parking.name, parking.x + parking.width/2, parking.y + parking.height + 15);
    });

    // Draw roads
    data.roads?.forEach(road => {
      ctx.strokeStyle = road.type === 'main' ? '#6b7280' : road.type === 'secondary' ? '#9ca3af' : '#d1d5db';
      ctx.lineWidth = road.width || 15;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(road.points[0][0], road.points[0][1]);
      for (let i = 1; i < road.points.length; i++) {
        ctx.lineTo(road.points[i][0], road.points[i][1]);
      }
      ctx.stroke();
      
      // Road center line (dashed for main roads)
      if (road.type === 'main') {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]);
        ctx.beginPath();
        ctx.moveTo(road.points[0][0], road.points[0][1]);
        for (let i = 1; i < road.points.length; i++) {
          ctx.lineTo(road.points[i][0], road.points[i][1]);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Road name
      if (road.name) {
        const midIdx = Math.floor(road.points.length / 2);
        const midPoint = road.points[midIdx];
        ctx.fillStyle = '#374151';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(road.name, midPoint[0], midPoint[1] + road.width/2 + 12);
      }
    });

    // Draw walkways
    ctx.strokeStyle = '#f5f5dc';
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 4]);
    data.walkways?.forEach(walkway => {
      ctx.beginPath();
      ctx.moveTo(walkway.from[0], walkway.from[1]);
      ctx.lineTo(walkway.to[0], walkway.to[1]);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw trees
    data.trees?.forEach(([x, y]) => {
      // Tree shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(x + 3, y + 12, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Tree crown
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#32CD32';
      ctx.beginPath();
      ctx.arc(x - 3, y - 3, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw given buildings (labeled, not to be identified)
    data.givenBuildings?.forEach(bldg => {
      if (bldg.style === 'gate') {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(bldg.x, bldg.y, bldg.width, bldg.height);
        ctx.strokeStyle = '#5D3A1A';
        ctx.lineWidth = 2;
        ctx.strokeRect(bldg.x, bldg.y, bldg.width, bldg.height);
        
        // Gate arch
        ctx.beginPath();
        ctx.arc(bldg.x + bldg.width/2, bldg.y, bldg.width/3, Math.PI, 0);
        ctx.stroke();
      } else if (bldg.style === 'plaza') {
        ctx.fillStyle = '#e5e5e5';
        ctx.fillRect(bldg.x, bldg.y, bldg.width, bldg.height);
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.strokeRect(bldg.x, bldg.y, bldg.width, bldg.height);
        
        // Plaza pattern
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        for (let i = bldg.x; i < bldg.x + bldg.width; i += 15) {
          ctx.beginPath();
          ctx.moveTo(i, bldg.y);
          ctx.lineTo(i, bldg.y + bldg.height);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#d1d5db';
        ctx.fillRect(bldg.x, bldg.y, bldg.width, bldg.height);
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.strokeRect(bldg.x, bldg.y, bldg.width, bldg.height);
      }
      
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(bldg.name, bldg.x + bldg.width/2, bldg.y + bldg.height/2 + 4);
    });

    // Draw buildings (to be labeled)
    data.buildings?.forEach(bldg => {
      // Building shadow
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(bldg.x + 5, bldg.y + 5, bldg.width, bldg.height);
      
      // Building body
      ctx.fillStyle = bldg.color || '#deb887';
      
      if (bldg.style === 'dome') {
        // Dome building
        ctx.fillRect(bldg.x, bldg.y + bldg.height/3, bldg.width, bldg.height * 2/3);
        ctx.beginPath();
        ctx.ellipse(bldg.x + bldg.width/2, bldg.y + bldg.height/3, bldg.width/2, bldg.height/3, 0, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeRect(bldg.x, bldg.y + bldg.height/3, bldg.width, bldg.height * 2/3);
      } else if (bldg.style === 'tower') {
        // Tower building
        ctx.fillRect(bldg.x, bldg.y, bldg.width, bldg.height);
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.strokeRect(bldg.x, bldg.y, bldg.width, bldg.height);
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        const rows = Math.floor(bldg.height / 20);
        for (let r = 0; r < rows; r++) {
          ctx.fillRect(bldg.x + 10, bldg.y + 8 + r * 18, bldg.width - 20, 10);
        }
      } else if (bldg.style === 'modern') {
        // Modern glass building
        ctx.fillRect(bldg.x, bldg.y, bldg.width, bldg.height);
        ctx.strokeStyle = '#4682B4';
        ctx.lineWidth = 2;
        ctx.strokeRect(bldg.x, bldg.y, bldg.width, bldg.height);
        
        // Glass lines
        ctx.strokeStyle = '#6BA3D6';
        ctx.lineWidth = 1;
        for (let i = bldg.x + 15; i < bldg.x + bldg.width; i += 15) {
          ctx.beginPath();
          ctx.moveTo(i, bldg.y);
          ctx.lineTo(i, bldg.y + bldg.height);
          ctx.stroke();
        }
      } else {
        // Classic building
        ctx.fillRect(bldg.x, bldg.y, bldg.width, bldg.height);
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.strokeRect(bldg.x, bldg.y, bldg.width, bldg.height);
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        const cols = Math.floor(bldg.width / 30);
        const wRows = Math.floor(bldg.height / 25);
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < wRows; r++) {
            ctx.fillRect(bldg.x + 8 + c * 28, bldg.y + 8 + r * 22, 18, 14);
          }
        }
      }
      
      // Label circle (letter)
      if (!bldg.given) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bldg.x + bldg.width/2, bldg.y - 18, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bldg.id, bldg.x + bldg.width/2, bldg.y - 18);
      }
    });

    // Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(data.title, w/2, 30);
    
    if (data.subtitle) {
      ctx.font = '14px Arial';
      ctx.fillStyle = '#6b7280';
      ctx.fillText(data.subtitle, w/2, 50);
    }

    // Compass
    if (data.showCompass) {
      const cx = w - 50;
      const cy = 70;
      
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // N arrow
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 6, cy);
      ctx.lineTo(cx + 6, cy);
      ctx.closePath();
      ctx.fill();
      
      // S arrow
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 20);
      ctx.lineTo(cx - 6, cy);
      ctx.lineTo(cx + 6, cy);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('N', cx, cy - 8);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.fillText('S', cx, cy + 14);
      ctx.fillText('E', cx + 14, cy + 3);
      ctx.fillText('W', cx - 14, cy + 3);
    }

    // Scale
    if (data.showScale) {
      const sx = 50;
      const sy = h - 30;
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 100, sy);
      ctx.moveTo(sx, sy - 5);
      ctx.lineTo(sx, sy + 5);
      ctx.moveTo(sx + 100, sy - 5);
      ctx.lineTo(sx + 100, sy + 5);
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '11px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('100 metres', sx + 50, sy + 15);
    }

    // Key/Legend
    if (data.showKey) {
      const kx = w - 140;
      const ky = h - 110;
      
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.fillRect(kx, ky, 130, 100);
      ctx.strokeRect(kx, ky, 130, 100);
      
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Key', kx + 50, ky + 14);
      
      // Building
      ctx.fillStyle = '#deb887';
      ctx.fillRect(kx + 10, ky + 24, 20, 12);
      ctx.strokeRect(kx + 10, ky + 24, 20, 12);
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.fillText('Building', kx + 35, ky + 34);
      
      // Road
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(kx + 10, ky + 42, 20, 8);
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Road', kx + 35, ky + 50);
      
      // Walkway
      ctx.strokeStyle = '#f5f5dc';
      ctx.lineWidth = 4;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(kx + 10, ky + 62);
      ctx.lineTo(kx + 30, ky + 62);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Walkway', kx + 35, ky + 66);
      
      // Trees
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(kx + 20, ky + 82, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.fillText('Trees', kx + 35, ky + 86);
    }
};
