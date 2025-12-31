import React, { useState, useRef, useEffect } from 'react';
import { Download, Code, Eye, Image as ImageIcon, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const VisualGenerator = () => {
  const canvasRef = useRef(null);
  const [jsonInput, setJsonInput] = useState('');
  const [visualData, setVisualData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedVisuals, setSavedVisuals] = useState([]);
  const [visualName, setVisualName] = useState('');

  // Example templates
  const examples = {
    map: `{
  "type": "map",
  "width": 800,
  "height": 600,
  "title": "Westbrook University Campus Map",
  "showCompass": true,
  "showGrid": false,
  "elements": [
    {
      "type": "road",
      "x": 50,
      "y": 450,
      "width": 700,
      "height": 40,
      "orientation": "horizontal",
      "label": "Main Campus Road"
    },
    {
      "type": "area",
      "x": 300,
      "y": 250,
      "width": 120,
      "height": 80,
      "label": "Central Lawn",
      "color": "#90EE90"
    },
    {
      "type": "building",
      "x": 350,
      "y": 350,
      "width": 100,
      "height": 70,
      "label": "A",
      "name": "Administration",
      "color": "#deb887"
    },
    {
      "type": "building",
      "x": 100,
      "y": 180,
      "width": 80,
      "height": 60,
      "label": "B",
      "name": "Science Complex",
      "color": "#87CEEB",
      "style": "glass"
    },
    {
      "type": "building",
      "x": 280,
      "y": 80,
      "width": 140,
      "height": 80,
      "label": "C",
      "name": "Main Library",
      "color": "#deb887"
    },
    {
      "type": "building",
      "x": 500,
      "y": 100,
      "width": 100,
      "height": 60,
      "label": "D",
      "name": "Student Union",
      "color": "#f4a460"
    },
    {
      "type": "building",
      "x": 600,
      "y": 180,
      "width": 70,
      "height": 120,
      "label": "E",
      "name": "Engineering",
      "color": "#b8860b",
      "style": "tower"
    },
    {
      "type": "building",
      "x": 580,
      "y": 330,
      "width": 80,
      "height": 50,
      "label": "F",
      "name": "Planetarium",
      "color": "#708090",
      "style": "dome"
    },
    {
      "type": "building",
      "x": 550,
      "y": 30,
      "width": 120,
      "height": 50,
      "label": "G",
      "name": "Sports Centre",
      "color": "#20B2AA"
    },
    {
      "type": "entrance",
      "x": 370,
      "y": 520,
      "width": 60,
      "height": 40,
      "label": "MAIN ENTRANCE"
    },
    {
      "type": "trees",
      "x": 250,
      "y": 220
    },
    {
      "type": "trees",
      "x": 450,
      "y": 220
    },
    {
      "type": "trees",
      "x": 250,
      "y": 330
    },
    {
      "type": "trees",
      "x": 450,
      "y": 330
    }
  ]
}`,
    chart: `{
  "type": "chart",
  "chartType": "bar",
  "width": 800,
  "height": 500,
  "title": "Energy Consumption by Sector (2020)",
  "data": [
    {"label": "Transport", "value": 28},
    {"label": "Industry", "value": 32},
    {"label": "Residential", "value": 22},
    {"label": "Commercial", "value": 18}
  ],
  "xLabel": "Sectors",
  "yLabel": "Percentage (%)",
  "color": "#3b82f6"
}`,
    diagram: `{
  "type": "diagram",
  "diagramType": "process",
  "width": 800,
  "height": 500,
  "title": "Chocolate Production Process",
  "nodes": [
    {"id": 1, "x": 80, "y": 100, "text": "Harvest Cocoa", "shape": "rectangle"},
    {"id": 2, "x": 280, "y": 100, "text": "Fermentation", "shape": "rectangle"},
    {"id": 3, "x": 480, "y": 100, "text": "Drying", "shape": "rectangle"},
    {"id": 4, "x": 180, "y": 250, "text": "Roasting", "shape": "rectangle"},
    {"id": 5, "x": 380, "y": 250, "text": "Grinding", "shape": "rectangle"},
    {"id": 6, "x": 580, "y": 250, "text": "Pressing", "shape": "rectangle"},
    {"id": 7, "x": 380, "y": 400, "text": "Final Product", "shape": "ellipse"}
  ],
  "arrows": [
    {"from": 1, "to": 2},
    {"from": 2, "to": 3},
    {"from": 3, "to": 4},
    {"from": 4, "to": 5},
    {"from": 5, "to": 6},
    {"from": 6, "to": 7}
  ]
}`,
    floor: `{
  "type": "floor",
  "width": 800,
  "height": 500,
  "title": "Riverside Shopping Centre - Ground Floor",
  "rooms": [
    {"x": 50, "y": 80, "width": 150, "height": 120, "label": "Bookshop", "door": "right"},
    {"x": 220, "y": 80, "width": 120, "height": 120, "label": "A", "door": "right", "unlabeled": true},
    {"x": 360, "y": 80, "width": 120, "height": 120, "label": "C", "door": "left", "unlabeled": true},
    {"x": 500, "y": 80, "width": 150, "height": 120, "label": "Costa", "door": "left"},
    {"x": 50, "y": 280, "width": 200, "height": 150, "label": "Hendersons", "door": "right"},
    {"x": 280, "y": 280, "width": 140, "height": 100, "label": "F", "door": "top", "unlabeled": true},
    {"x": 500, "y": 280, "width": 150, "height": 150, "label": "South Entrance", "door": "bottom"}
  ],
  "furniture": [
    {"type": "fountain", "x": 400, "y": 220}
  ],
  "corridors": [
    {"x": 50, "y": 200, "width": 600, "height": 60}
  ]
}`
  };

  // Load saved visuals on mount
  useEffect(() => {
    loadSavedVisuals();
  }, []);

  useEffect(() => {
    if (visualData) {
      renderVisual(visualData);
    }
  }, [visualData]);

  const loadSavedVisuals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/visuals/list`);
      if (res.ok) {
        const data = await res.json();
        setSavedVisuals(data.visuals || []);
      }
    } catch (err) {
      console.log('Could not load saved visuals');
    }
  };

  const parseJSON = () => {
    try {
      const data = JSON.parse(jsonInput);
      setVisualData(data);
      setError('');
    } catch (e) {
      setError(`JSON Parse Error: ${e.message}`);
    }
  };

  const loadExample = (type) => {
    setJsonInput(examples[type]);
    setVisualName(`${type}_example`);
  };

  const renderVisual = (data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = data.width || 800;
    canvas.height = data.height || 600;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render based on type
    switch (data.type) {
      case 'map':
        renderMap(ctx, data);
        break;
      case 'chart':
        renderChart(ctx, data);
        break;
      case 'diagram':
        renderDiagram(ctx, data);
        break;
      case 'floor':
        renderFloorPlan(ctx, data);
        break;
      default:
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText('Unknown visual type', 50, 50);
    }
  };

  const renderMap = (ctx, data) => {
    // Background
    ctx.fillStyle = '#fefef8';
    ctx.fillRect(0, 0, data.width, data.height);

    // Grid
    if (data.showGrid) {
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < data.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, data.height);
        ctx.stroke();
      }
      for (let i = 0; i < data.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(data.width, i);
        ctx.stroke();
      }
    }

    // Title
    if (data.title) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.title, data.width / 2, 30);
    }

    // Elements
    data.elements?.forEach(element => {
      ctx.save();

      switch (element.type) {
        case 'building':
          // Building fill
          ctx.fillStyle = element.color || '#f3f4f6';
          
          if (element.style === 'dome') {
            // Dome building
            ctx.beginPath();
            ctx.ellipse(element.x + element.width/2, element.y + element.height, element.width/2, element.height/2, 0, Math.PI, 0);
            ctx.fill();
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else if (element.style === 'glass') {
            // Glass building with lines
            ctx.fillRect(element.x, element.y, element.width, element.height);
            ctx.strokeStyle = '#4682B4';
            ctx.lineWidth = 2;
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            // Vertical lines for glass effect
            ctx.lineWidth = 1;
            for (let i = element.x + 15; i < element.x + element.width; i += 15) {
              ctx.beginPath();
              ctx.moveTo(i, element.y);
              ctx.lineTo(i, element.y + element.height);
              ctx.stroke();
            }
          } else {
            // Regular building
            ctx.fillRect(element.x, element.y, element.width, element.height);
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            ctx.strokeRect(element.x, element.y, element.width, element.height);
            
            // Windows
            ctx.fillStyle = '#87CEEB';
            const windowRows = Math.floor(element.height / 25);
            const windowCols = Math.floor(element.width / 30);
            for (let row = 0; row < windowRows; row++) {
              for (let col = 0; col < windowCols; col++) {
                ctx.fillRect(element.x + 10 + col * 28, element.y + 10 + row * 22, 15, 12);
              }
            }
          }

          // Label circle
          if (element.label) {
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
            const labelX = element.x + element.width / 2;
            const labelY = element.y - 15;
            ctx.beginPath();
            ctx.arc(labelX, labelY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(element.label, labelX, labelY);
          }
          break;

        case 'road':
          ctx.fillStyle = '#9ca3af';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          
          // Road markings
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.setLineDash([15, 10]);
          if (element.orientation === 'horizontal') {
            ctx.beginPath();
            ctx.moveTo(element.x, element.y + element.height / 2);
            ctx.lineTo(element.x + element.width, element.y + element.height / 2);
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(element.x + element.width / 2, element.y);
            ctx.lineTo(element.x + element.width / 2, element.y + element.height);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          
          // Road label
          if (element.label) {
            ctx.fillStyle = '#374151';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(element.label, element.x + element.width/2, element.y + element.height + 15);
          }
          break;

        case 'area':
          ctx.fillStyle = element.color || '#dcfce7';
          ctx.strokeStyle = '#16a34a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(
            element.x + element.width / 2,
            element.y + element.height / 2,
            element.width / 2,
            element.height / 2,
            0, 0, Math.PI * 2
          );
          ctx.fill();
          ctx.stroke();
          
          if (element.label) {
            ctx.fillStyle = '#166534';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(element.label, element.x + element.width / 2, element.y + element.height / 2 + 5);
          }
          break;

        case 'trees':
          // Draw tree cluster
          ctx.fillStyle = '#228B22';
          ctx.beginPath();
          ctx.arc(element.x, element.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(element.x - 8, element.y + 8, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(element.x + 8, element.y + 8, 10, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'entrance':
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.strokeStyle = '#5D3A1A';
          ctx.lineWidth = 2;
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          
          if (element.label) {
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(element.label, element.x + element.width/2, element.y + element.height + 15);
          }
          break;

        case 'label':
        case 'text':
          ctx.fillStyle = element.color || '#1f2937';
          ctx.font = element.fontSize ? `${element.fontSize}px Arial` : '14px Arial';
          ctx.textAlign = element.align || 'left';
          ctx.fillText(element.text, element.x, element.y);
          break;
      }

      ctx.restore();
    });

    // Compass
    if (data.showCompass) {
      const compassX = data.width - 50;
      const compassY = 50;
      
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(compassX, compassY, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', compassX, compassY - 15);
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.fillText('S', compassX, compassY + 15);
      ctx.fillText('E', compassX + 15, compassY);
      ctx.fillText('W', compassX - 15, compassY);
      
      // Arrow
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(compassX, compassY - 8);
      ctx.lineTo(compassX - 4, compassY);
      ctx.lineTo(compassX + 4, compassY);
      ctx.closePath();
      ctx.fill();
    }

    // Key/Legend
    const keyX = data.width - 120;
    const keyY = data.height - 80;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.fillRect(keyX, keyY, 110, 70);
    ctx.strokeRect(keyX, keyY, 110, 70);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Key', keyX + 45, keyY + 12);
    
    // Building icon
    ctx.fillStyle = '#deb887';
    ctx.fillRect(keyX + 10, keyY + 20, 15, 10);
    ctx.strokeRect(keyX + 10, keyY + 20, 15, 10);
    ctx.font = '9px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('Building', keyX + 30, keyY + 28);
    
    // Trees icon
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(keyX + 17, keyY + 45, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1f2937';
    ctx.fillText('Trees', keyX + 30, keyY + 48);
    
    // Road icon
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(keyX + 10, keyY + 55, 15, 6);
    ctx.fillStyle = '#1f2937';
    ctx.fillText('Road', keyX + 30, keyY + 62);
  };

  const renderChart = (ctx, data) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, data.width, data.height);

    // Title
    if (data.title) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.title, data.width / 2, 35);
    }

    const padding = 80;
    const chartWidth = data.width - padding * 2;
    const chartHeight = data.height - padding * 2 - 20;
    const maxValue = Math.max(...data.data.map(d => d.value));
    const barWidth = chartWidth / data.data.length - 20;

    // Axes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, data.height - padding);
    ctx.lineTo(data.width - padding, data.height - padding);
    ctx.stroke();

    // Y-axis labels and grid
    ctx.fillStyle = '#1f2937';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const y = data.height - padding - (chartHeight / 5) * i;
      const value = Math.round((maxValue / 5) * i);
      ctx.fillText(value.toString(), padding - 10, y + 5);
      
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(data.width - padding, y);
      ctx.stroke();
    }

    // Bars
    data.data.forEach((item, index) => {
      const x = padding + index * (chartWidth / data.data.length) + 10;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = data.height - padding - barHeight;

      ctx.fillStyle = data.color || '#3b82f6';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Value on top of bar
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);

      // X-axis labels
      ctx.font = '12px Arial';
      ctx.fillText(item.label, x + barWidth / 2, data.height - padding + 20);
    });

    // Axis labels
    if (data.yLabel) {
      ctx.save();
      ctx.translate(20, data.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#1f2937';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.yLabel, 0, 0);
      ctx.restore();
    }

    if (data.xLabel) {
      ctx.fillStyle = '#1f2937';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.xLabel, data.width / 2, data.height - 15);
    }
  };

  const renderDiagram = (ctx, data) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, data.width, data.height);

    // Title
    if (data.title) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.title, data.width / 2, 35);
    }

    // Draw arrows first
    data.arrows?.forEach(arrow => {
      const fromNode = data.nodes.find(n => n.id === arrow.from);
      const toNode = data.nodes.find(n => n.id === arrow.to);
      
      if (fromNode && toNode) {
        ctx.strokeStyle = '#1f2937';
        ctx.fillStyle = '#1f2937';
        ctx.lineWidth = 2;
        
        const fromX = fromNode.x + 70;
        const fromY = fromNode.y + 30;
        const toX = toNode.x;
        const toY = toNode.y + 30;
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX - 10, toY);
        ctx.stroke();
        
        // Arrow head
        ctx.beginPath();
        ctx.moveTo(toX - 5, toY);
        ctx.lineTo(toX - 15, toY - 6);
        ctx.lineTo(toX - 15, toY + 6);
        ctx.closePath();
        ctx.fill();
      }
    });

    // Draw nodes
    data.nodes.forEach(node => {
      ctx.save();
      
      const nodeWidth = 140;
      const nodeHeight = 60;
      
      if (node.shape === 'ellipse') {
        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(node.x + nodeWidth/2, node.y + nodeHeight/2, nodeWidth/2, nodeHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#dbeafe';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.fillRect(node.x, node.y, nodeWidth, nodeHeight);
        ctx.strokeRect(node.x, node.y, nodeWidth, nodeHeight);
      }
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '13px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.text, node.x + nodeWidth/2, node.y + nodeHeight/2);
      
      ctx.restore();
    });
  };

  const renderFloorPlan = (ctx, data) => {
    ctx.fillStyle = '#fafaf5';
    ctx.fillRect(0, 0, data.width, data.height);

    // Title
    if (data.title) {
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.title, data.width / 2, 30);
    }

    // Corridors
    data.corridors?.forEach(corridor => {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(corridor.x, corridor.y, corridor.width, corridor.height);
    });

    // Rooms
    data.rooms?.forEach(room => {
      ctx.fillStyle = room.unlabeled ? '#fff7ed' : '#f9fafb';
      ctx.fillRect(room.x, room.y, room.width, room.height);
      
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 3;
      ctx.strokeRect(room.x, room.y, room.width, room.height);
      
      // Door
      if (room.door) {
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 4;
        const doorSize = 25;
        switch (room.door) {
          case 'top':
            ctx.beginPath();
            ctx.moveTo(room.x + room.width / 2 - doorSize, room.y);
            ctx.lineTo(room.x + room.width / 2 + doorSize, room.y);
            ctx.stroke();
            break;
          case 'bottom':
            ctx.beginPath();
            ctx.moveTo(room.x + room.width / 2 - doorSize, room.y + room.height);
            ctx.lineTo(room.x + room.width / 2 + doorSize, room.y + room.height);
            ctx.stroke();
            break;
          case 'left':
            ctx.beginPath();
            ctx.moveTo(room.x, room.y + room.height / 2 - doorSize);
            ctx.lineTo(room.x, room.y + room.height / 2 + doorSize);
            ctx.stroke();
            break;
          case 'right':
            ctx.beginPath();
            ctx.moveTo(room.x + room.width, room.y + room.height / 2 - doorSize);
            ctx.lineTo(room.x + room.width, room.y + room.height / 2 + doorSize);
            ctx.stroke();
            break;
        }
      }
      
      // Label
      if (room.unlabeled) {
        // Circle label for unlabeled rooms
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        const cx = room.x + room.width / 2;
        const cy = room.y + room.height / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.label, cx, cy);
      } else {
        ctx.fillStyle = '#1f2937';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(room.label, room.x + room.width / 2, room.y + room.height / 2);
      }
    });

    // Furniture
    data.furniture?.forEach(item => {
      switch (item.type) {
        case 'fountain':
          ctx.fillStyle = '#93c5fd';
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(item.x, item.y, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#1f2937';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Fountain', item.x, item.y + 35);
          break;
        case 'desk':
          ctx.fillStyle = '#d1d5db';
          ctx.fillRect(item.x - 20, item.y - 10, 40, 20);
          ctx.strokeStyle = '#1f2937';
          ctx.lineWidth = 1;
          ctx.strokeRect(item.x - 20, item.y - 10, 40, 20);
          break;
        case 'table':
          ctx.fillStyle = '#d1d5db';
          ctx.beginPath();
          ctx.arc(item.x, item.y, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
      }
    });
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `ielts-visual-${visualName || Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const saveVisual = async () => {
    if (!visualName.trim()) {
      toast.error('Please enter a name for the visual');
      return;
    }
    if (!visualData) {
      toast.error('Generate a visual first');
      return;
    }

    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL('image/png');
      
      const res = await fetch(`${API_URL}/api/visuals/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: visualName,
          json_data: visualData,
          image_data: imageData
        })
      });

      if (res.ok) {
        toast.success('Visual saved successfully!');
        loadSavedVisuals();
      } else {
        toast.error('Failed to save visual');
      }
    } catch (err) {
      toast.error('Error saving visual');
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              IELTS Visual Generator
            </h1>
            <p className="text-slate-600">
              Generate maps, charts, diagrams, and floor plans from JSON
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON Input */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Code size={20} />
                    JSON Input
                  </h3>
                  <Button onClick={parseJSON} className="bg-blue-500 hover:bg-blue-600">
                    <Eye size={18} className="mr-2" />
                    Generate
                  </Button>
                </div>

                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-80 p-3 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste your JSON here..."
                />

                {error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Example Templates */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Load Example:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => loadExample('map')}
                    className="p-3 bg-white rounded-lg hover:bg-slate-100 text-left text-sm border"
                  >
                    📍 Map (Campus)
                  </button>
                  <button
                    onClick={() => loadExample('chart')}
                    className="p-3 bg-white rounded-lg hover:bg-slate-100 text-left text-sm border"
                  >
                    📊 Bar Chart
                  </button>
                  <button
                    onClick={() => loadExample('diagram')}
                    className="p-3 bg-white rounded-lg hover:bg-slate-100 text-left text-sm border"
                  >
                    🔄 Process Diagram
                  </button>
                  <button
                    onClick={() => loadExample('floor')}
                    className="p-3 bg-white rounded-lg hover:bg-slate-100 text-left text-sm border"
                  >
                    🏢 Floor Plan
                  </button>
                </div>
              </div>

              {/* Save Section */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Save Visual</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={visualName}
                    onChange={(e) => setVisualName(e.target.value)}
                    placeholder="Visual name (e.g., campus_map_set_c)"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <Button onClick={saveVisual} disabled={saving} className="bg-green-500 hover:bg-green-600">
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Visual Output */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <ImageIcon size={20} />
                    Visual Output
                  </h3>
                  <Button
                    onClick={exportImage}
                    disabled={!visualData}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50"
                  >
                    <Download size={18} className="mr-2" />
                    Export PNG
                  </Button>
                </div>

                <div className="bg-white rounded-lg border-2 border-slate-200 p-4 flex items-center justify-center min-h-[500px] overflow-auto">
                  {visualData ? (
                    <canvas
                      ref={canvasRef}
                      className="border border-slate-300 rounded max-w-full"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Load an example or paste JSON to generate visual</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Visuals */}
              {savedVisuals.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Saved Visuals</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
                    {savedVisuals.map((v, i) => (
                      <div key={i} className="p-2 bg-white rounded border text-sm truncate">
                        {v.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualGenerator;
