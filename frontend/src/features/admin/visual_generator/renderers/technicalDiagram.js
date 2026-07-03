// renderTechnicalDiagram — verbatim from pages/VisualGenerator.js lines 939-1283 (Faz1 wave 10).
// Pure (ctx, data) canvas renderer — closes over nothing from the component.
  // ============ TECHNICAL DIAGRAM RENDERER ============
export const renderTechnicalDiagram = (ctx, data) => {
    const w = data.width;
    const h = data.height;

    // Background
    ctx.fillStyle = '#f8fafc';
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

    // Conveyor belt
    data.conveyors?.forEach(conv => {
      ctx.fillStyle = '#374151';
      ctx.fillRect(conv.x, conv.y, conv.width, conv.height);
      
      // Belt rollers
      ctx.fillStyle = '#6b7280';
      for (let i = conv.x + 20; i < conv.x + conv.width; i += 40) {
        ctx.beginPath();
        ctx.arc(i, conv.y + conv.height/2, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Direction arrow
      ctx.fillStyle = '#fbbf24';
      const arrowX = conv.x + conv.width/2;
      ctx.beginPath();
      ctx.moveTo(arrowX + 20, conv.y + conv.height/2);
      ctx.lineTo(arrowX, conv.y + 5);
      ctx.lineTo(arrowX, conv.y + conv.height - 5);
      ctx.closePath();
      ctx.fill();
    });

    // Output bins
    data.outputBins?.forEach(bin => {
      ctx.fillStyle = '#e5e7eb';
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      
      // Bin shape (tapered)
      ctx.beginPath();
      ctx.moveTo(bin.x + 10, bin.y);
      ctx.lineTo(bin.x + bin.width - 10, bin.y);
      ctx.lineTo(bin.x + bin.width, bin.y + bin.height);
      ctx.lineTo(bin.x, bin.y + bin.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(bin.label, bin.x + bin.width/2, bin.y + bin.height + 15);
    });

    // Pipes
    data.pipes?.forEach(pipe => {
      ctx.strokeStyle = '#6b7280';
      ctx.lineWidth = pipe.type === 'solid' ? 8 : 6;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(pipe.from[0], pipe.from[1]);
      ctx.lineTo(pipe.to[0], pipe.to[1]);
      ctx.stroke();
      
      // Pipe inner
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pipe.from[0], pipe.from[1]);
      ctx.lineTo(pipe.to[0], pipe.to[1]);
      ctx.stroke();
      
      // Flow arrows
      if (pipe.flow) {
        const midX = (pipe.from[0] + pipe.to[0]) / 2;
        const midY = (pipe.from[1] + pipe.to[1]) / 2;
        const angle = Math.atan2(pipe.to[1] - pipe.from[1], pipe.to[0] - pipe.from[0]);
        
        ctx.fillStyle = '#3b82f6';
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -5);
        ctx.lineTo(-4, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });

    // Containers
    data.containers?.forEach(cont => {
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      
      switch (cont.type) {
        case 'hopper':
          // Hopper shape (inverted trapezoid)
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.moveTo(cont.x, cont.y);
          ctx.lineTo(cont.x + cont.width, cont.y);
          ctx.lineTo(cont.x + cont.width * 0.7, cont.y + cont.height);
          ctx.lineTo(cont.x + cont.width * 0.3, cont.y + cont.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
          
        case 'tank':
          // Cylindrical tank
          ctx.fillStyle = '#dbeafe';
          ctx.fillRect(cont.x, cont.y + 15, cont.width, cont.height - 30);
          ctx.strokeRect(cont.x, cont.y + 15, cont.width, cont.height - 30);
          
          // Top ellipse
          ctx.beginPath();
          ctx.ellipse(cont.x + cont.width/2, cont.y + 15, cont.width/2, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Bottom ellipse
          ctx.beginPath();
          ctx.ellipse(cont.x + cont.width/2, cont.y + cont.height - 15, cont.width/2, 15, 0, 0, Math.PI);
          ctx.fill();
          ctx.stroke();
          break;
          
        case 'cylinder':
          // Horizontal cylinder (drum)
          ctx.fillStyle = '#fecaca';
          ctx.fillRect(cont.x + 15, cont.y, cont.width - 30, cont.height);
          ctx.strokeRect(cont.x + 15, cont.y, cont.width - 30, cont.height);
          
          // Left cap
          ctx.beginPath();
          ctx.ellipse(cont.x + 15, cont.y + cont.height/2, 15, cont.height/2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          // Right cap
          ctx.beginPath();
          ctx.ellipse(cont.x + cont.width - 15, cont.y + cont.height/2, 15, cont.height/2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
          
        case 'chamber':
          // Roasting chamber with vent
          ctx.fillStyle = '#fed7aa';
          ctx.fillRect(cont.x, cont.y, cont.width, cont.height);
          ctx.strokeRect(cont.x, cont.y, cont.width, cont.height);
          
          // Vent on top
          ctx.fillStyle = '#9ca3af';
          ctx.fillRect(cont.x + cont.width/2 - 10, cont.y - 20, 20, 20);
          ctx.strokeRect(cont.x + cont.width/2 - 10, cont.y - 20, 20, 20);
          break;
          
        case 'grinder':
          // Grinder with funnel
          ctx.fillStyle = '#d1d5db';
          ctx.fillRect(cont.x, cont.y + 30, cont.width, cont.height - 30);
          ctx.strokeRect(cont.x, cont.y + 30, cont.width, cont.height - 30);
          
          // Funnel top
          ctx.beginPath();
          ctx.moveTo(cont.x - 10, cont.y);
          ctx.lineTo(cont.x + cont.width + 10, cont.y);
          ctx.lineTo(cont.x + cont.width, cont.y + 30);
          ctx.lineTo(cont.x, cont.y + 30);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
      }
      
      // Label circle
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cont.x + cont.width/2, cont.y - 25, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cont.id, cont.x + cont.width/2, cont.y - 25);
    });

    // Valves
    data.valves?.forEach(valve => {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      
      // Valve body (bowtie shape)
      ctx.beginPath();
      ctx.moveTo(valve.x - 10, valve.y - 8);
      ctx.lineTo(valve.x, valve.y);
      ctx.lineTo(valve.x - 10, valve.y + 8);
      ctx.lineTo(valve.x + 10, valve.y - 8);
      ctx.lineTo(valve.x, valve.y);
      ctx.lineTo(valve.x + 10, valve.y + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Valve handle
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(valve.x - 2, valve.y - 18, 4, 10);
      ctx.beginPath();
      ctx.arc(valve.x, valve.y - 20, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Motors
    data.motors?.forEach(motor => {
      ctx.fillStyle = '#4ade80';
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(motor.x, motor.y, motor.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // M symbol
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', motor.x, motor.y);
      
      // Label
      if (motor.label) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(motor.x + motor.size + 12, motor.y - motor.size, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(motor.label, motor.x + motor.size + 12, motor.y - motor.size);
      }
    });

    // Sensors
    data.sensors?.forEach(sensor => {
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      
      // Sensor body
      ctx.beginPath();
      ctx.arc(sensor.x, sensor.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Sensor symbol
      if (sensor.type === 'temperature') {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sensor.x, sensor.y - 6);
        ctx.lineTo(sensor.x, sensor.y + 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sensor.x, sensor.y + 6, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Label
      if (sensor.label) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(sensor.x + 20, sensor.y - 15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sensor.label, sensor.x + 20, sensor.y - 15);
      }
    });

    // Annotations
    data.annotations?.forEach(ann => {
      ctx.fillStyle = '#6b7280';
      ctx.font = 'italic 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(ann.text, ann.x, ann.y);
    });

    // Arrows with labels
    data.arrows?.forEach(arrow => {
      ctx.strokeStyle = '#1f2937';
      ctx.fillStyle = '#1f2937';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(arrow.from[0], arrow.from[1]);
      ctx.lineTo(arrow.to[0], arrow.to[1]);
      ctx.stroke();
      
      // Arrowhead
      const angle = Math.atan2(arrow.to[1] - arrow.from[1], arrow.to[0] - arrow.from[0]);
      ctx.save();
      ctx.translate(arrow.to[0], arrow.to[1]);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, -5);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      
      if (arrow.label) {
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(arrow.label, (arrow.from[0] + arrow.to[0])/2, (arrow.from[1] + arrow.to[1])/2 - 5);
      }
    });
};
