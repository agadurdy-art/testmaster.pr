import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Code, Eye, Image as ImageIcon, Save, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * IELTS Visual Generator - Advanced Version
 * Supports: Realistic Maps, Technical Diagrams, Charts, Floor Plans
 * 
 * Key improvements:
 * - Maps with paths, roads, walkways connecting buildings
 * - Environmental elements (trees, lakes, parks, grass areas)
 * - Technical diagrams with machine parts, arrows, labels
 * - Real-world inspired layouts
 */

const VisualGenerator = () => {
  const canvasRef = useRef(null);
  const [jsonInput, setJsonInput] = useState('');
  const [visualData, setVisualData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedVisuals, setSavedVisuals] = useState([]);
  const [visualName, setVisualName] = useState('');

  // ============ EXAMPLE TEMPLATES ============
  const examples = {
    // Realistic Campus Map (inspired by Boğaziçi University style)
    campus_map: `{
  "type": "campus_map",
  "width": 900,
  "height": 700,
  "title": "Westbrook University - South Campus",
  "subtitle": "Map for Questions 1-7",
  "showCompass": true,
  "showScale": true,
  "showKey": true,
  "background": "#e8f4e8",
  
  "roads": [
    {"id": "main_road", "type": "main", "points": [[50, 600], [850, 600]], "name": "University Avenue", "width": 25},
    {"id": "campus_drive", "type": "main", "points": [[450, 600], [450, 100]], "name": "Campus Drive", "width": 20},
    {"id": "east_path", "type": "secondary", "points": [[450, 350], [750, 350]], "name": "", "width": 12},
    {"id": "west_path", "type": "secondary", "points": [[450, 350], [150, 350]], "name": "", "width": 12},
    {"id": "north_loop", "type": "path", "points": [[200, 200], [350, 120], [550, 120], [700, 200]], "name": "", "width": 8}
  ],
  
  "walkways": [
    {"from": [450, 500], "to": [300, 450]},
    {"from": [450, 500], "to": [600, 450]},
    {"from": [300, 350], "to": [300, 250]},
    {"from": [600, 350], "to": [600, 250]},
    {"from": [450, 250], "to": [350, 180]},
    {"from": [450, 250], "to": [550, 180]}
  ],
  
  "buildings": [
    {"id": "A", "x": 380, "y": 480, "width": 140, "height": 80, "name": "Main Library", "style": "classic", "color": "#d4a574", "given": false},
    {"id": "B", "x": 180, "y": 400, "width": 100, "height": 70, "name": "Science Block", "style": "modern", "color": "#87CEEB", "given": false},
    {"id": "C", "x": 620, "y": 400, "width": 100, "height": 70, "name": "Engineering", "style": "tower", "color": "#b8860b", "given": false},
    {"id": "D", "x": 220, "y": 200, "width": 120, "height": 60, "name": "Student Union", "style": "classic", "color": "#f4a460", "given": false},
    {"id": "E", "x": 560, "y": 200, "width": 120, "height": 60, "name": "Admin Building", "style": "classic", "color": "#deb887", "given": false},
    {"id": "F", "x": 380, "y": 100, "width": 140, "height": 70, "name": "Sports Centre", "style": "dome", "color": "#20B2AA", "given": false},
    {"id": "G", "x": 720, "y": 280, "width": 80, "height": 100, "name": "Lecture Hall", "style": "classic", "color": "#d4a574", "given": false}
  ],
  
  "givenBuildings": [
    {"x": 80, "y": 550, "width": 80, "height": 50, "name": "Main Gate", "style": "gate"},
    {"x": 750, "y": 550, "width": 80, "height": 50, "name": "East Gate", "style": "gate"},
    {"x": 400, "y": 300, "width": 100, "height": 60, "name": "Central Plaza", "style": "plaza"}
  ],
  
  "greenAreas": [
    {"type": "lawn", "x": 100, "y": 250, "width": 80, "height": 100, "name": "West Lawn"},
    {"type": "lawn", "x": 720, "y": 400, "width": 70, "height": 80, "name": "East Garden"},
    {"type": "park", "x": 500, "y": 280, "width": 50, "height": 50}
  ],
  
  "water": [
    {"type": "lake", "x": 100, "y": 120, "width": 80, "height": 50, "name": "Campus Lake"}
  ],
  
  "trees": [
    [150, 180], [170, 200], [130, 220],
    [750, 180], [770, 200], [730, 220],
    [320, 280], [340, 300], [580, 280], [560, 300],
    [200, 500], [220, 520], [680, 500], [700, 520]
  ],
  
  "parkingAreas": [
    {"x": 80, "y": 450, "width": 60, "height": 80, "name": "P1"},
    {"x": 760, "y": 450, "width": 60, "height": 80, "name": "P2"}
  ]
}`,

    // Shopping Centre Floor Plan
    shopping_floor: `{
  "type": "floor_plan",
  "width": 900,
  "height": 600,
  "title": "Riverside Shopping Centre - Ground Floor",
  "subtitle": "Label the shops A-H",
  "showKey": true,
  
  "corridors": [
    {"x": 50, "y": 250, "width": 800, "height": 100, "type": "main"},
    {"x": 400, "y": 50, "width": 100, "height": 500, "type": "main"}
  ],
  
  "rooms": [
    {"id": "A", "x": 50, "y": 50, "width": 150, "height": 180, "door": "bottom", "unlabeled": true},
    {"id": "B", "x": 220, "y": 50, "width": 160, "height": 180, "door": "bottom", "unlabeled": true},
    {"id": "C", "x": 520, "y": 50, "width": 160, "height": 180, "door": "bottom", "unlabeled": true},
    {"id": "D", "x": 700, "y": 50, "width": 150, "height": 180, "door": "bottom", "unlabeled": true},
    {"id": "E", "x": 50, "y": 370, "width": 150, "height": 180, "door": "top", "unlabeled": true},
    {"id": "F", "x": 220, "y": 370, "width": 160, "height": 180, "door": "top", "unlabeled": true},
    {"id": "G", "x": 520, "y": 370, "width": 160, "height": 180, "door": "top", "unlabeled": true},
    {"id": "H", "x": 700, "y": 370, "width": 150, "height": 180, "door": "top", "unlabeled": true}
  ],
  
  "givenRooms": [
    {"x": 380, "y": 270, "width": 140, "height": 60, "name": "Information Desk", "style": "info"},
    {"x": 50, "y": 250, "width": 80, "height": 100, "name": "Main Entrance", "style": "entrance"},
    {"x": 770, "y": 250, "width": 80, "height": 100, "name": "South Exit", "style": "entrance"}
  ],
  
  "features": [
    {"type": "escalator", "x": 350, "y": 150, "direction": "up"},
    {"type": "escalator", "x": 350, "y": 450, "direction": "down"},
    {"type": "lift", "x": 480, "y": 300},
    {"type": "fountain", "x": 450, "y": 300, "size": 30},
    {"type": "toilets", "x": 820, "y": 300}
  ],
  
  "benches": [
    {"x": 300, "y": 285}, {"x": 300, "y": 315},
    {"x": 600, "y": 285}, {"x": 600, "y": 315}
  ]
}`,

    // Technical Process Diagram (Machine/Manufacturing)
    process_diagram: `{
  "type": "technical_diagram",
  "width": 900,
  "height": 600,
  "title": "Coffee Bean Processing System",
  "subtitle": "Label the parts numbered 1-8",
  "showLabels": true,
  
  "containers": [
    {"id": "1", "type": "hopper", "x": 100, "y": 80, "width": 80, "height": 100, "label": "Input Hopper"},
    {"id": "2", "type": "tank", "x": 250, "y": 150, "width": 100, "height": 120, "label": "Washing Tank"},
    {"id": "3", "type": "cylinder", "x": 420, "y": 100, "width": 120, "height": 80, "label": "Drying Drum"},
    {"id": "4", "type": "chamber", "x": 600, "y": 80, "width": 100, "height": 140, "label": "Roasting Chamber"},
    {"id": "5", "type": "grinder", "x": 750, "y": 150, "width": 80, "height": 100, "label": "Grinding Mill"}
  ],
  
  "pipes": [
    {"from": [140, 180], "to": [250, 200], "type": "solid", "flow": true},
    {"from": [350, 200], "to": [420, 140], "type": "solid", "flow": true},
    {"from": [540, 140], "to": [600, 150], "type": "solid", "flow": true},
    {"from": [700, 150], "to": [750, 180], "type": "solid", "flow": true}
  ],
  
  "valves": [
    {"x": 195, "y": 190, "type": "gate"},
    {"x": 385, "y": 170, "type": "control"},
    {"x": 570, "y": 145, "type": "gate"}
  ],
  
  "motors": [
    {"x": 480, "y": 180, "size": 30, "label": "6"},
    {"x": 790, "y": 250, "size": 30, "label": "7"}
  ],
  
  "sensors": [
    {"x": 300, "y": 280, "type": "temperature", "label": "8"}
  ],
  
  "conveyors": [
    {"x": 100, "y": 350, "width": 700, "height": 30, "direction": "right"}
  ],
  
  "outputBins": [
    {"x": 150, "y": 400, "width": 60, "height": 80, "label": "Waste"},
    {"x": 350, "y": 400, "width": 80, "height": 80, "label": "Grade A"},
    {"x": 550, "y": 400, "width": 80, "height": 80, "label": "Grade B"},
    {"x": 750, "y": 400, "width": 60, "height": 80, "label": "Final Product"}
  ],
  
  "arrows": [
    {"from": [180, 420], "to": [180, 380], "label": "reject"},
    {"from": [390, 420], "to": [390, 380], "label": "premium"},
    {"from": [590, 420], "to": [590, 380], "label": "standard"}
  ],
  
  "annotations": [
    {"x": 100, "y": 50, "text": "Raw beans input"},
    {"x": 750, "y": 50, "text": "Ground coffee output"}
  ]
}`,

    // Bar Chart with multiple series
    bar_chart: `{
  "type": "bar_chart",
  "width": 800,
  "height": 500,
  "title": "Energy Consumption by Sector (2015-2020)",
  "subtitle": "in million tonnes of oil equivalent",
  "showGrid": true,
  "showLegend": true,
  
  "categories": ["2015", "2016", "2017", "2018", "2019", "2020"],
  
  "series": [
    {"name": "Industry", "color": "#3b82f6", "values": [245, 252, 260, 268, 275, 258]},
    {"name": "Transport", "color": "#ef4444", "values": [180, 188, 195, 202, 210, 175]},
    {"name": "Residential", "color": "#22c55e", "values": [120, 125, 128, 132, 135, 145]}
  ],
  
  "xLabel": "Year",
  "yLabel": "Consumption (Mtoe)",
  "yMax": 300
}`,

    // Pie Chart
    pie_chart: `{
  "type": "pie_chart",
  "width": 700,
  "height": 500,
  "title": "World Energy Sources (2020)",
  "subtitle": "Total: 583 exajoules",
  "showLegend": true,
  "showPercentages": true,
  
  "data": [
    {"label": "Oil", "value": 31, "color": "#1f2937"},
    {"label": "Coal", "value": 27, "color": "#6b7280"},
    {"label": "Natural Gas", "value": 25, "color": "#3b82f6"},
    {"label": "Renewables", "value": 12, "color": "#22c55e"},
    {"label": "Nuclear", "value": 5, "color": "#f59e0b"}
  ]
}`,

    // Line Graph
    line_graph: `{
  "type": "line_graph",
  "width": 800,
  "height": 500,
  "title": "Global Temperature Anomaly (1980-2020)",
  "subtitle": "Deviation from 1951-1980 average (°C)",
  "showGrid": true,
  "showPoints": true,
  
  "xLabels": ["1980", "1985", "1990", "1995", "2000", "2005", "2010", "2015", "2020"],
  
  "series": [
    {
      "name": "Land",
      "color": "#ef4444",
      "values": [0.26, 0.12, 0.45, 0.45, 0.42, 0.69, 0.72, 0.90, 1.02]
    },
    {
      "name": "Ocean",
      "color": "#3b82f6",
      "values": [0.18, 0.08, 0.32, 0.28, 0.32, 0.48, 0.54, 0.65, 0.78]
    }
  ],
  
  "xLabel": "Year",
  "yLabel": "Temperature Anomaly (°C)",
  "yMin": -0.2,
  "yMax": 1.2
}`
  };

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
    setVisualName(type);
  };

  // ============ MAIN RENDER FUNCTION ============
  const renderVisual = useCallback((data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = data.width || 800;
    canvas.height = data.height || 600;

    // Clear with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    switch (data.type) {
      case 'campus_map':
        renderCampusMap(ctx, data);
        break;
      case 'floor_plan':
        renderFloorPlan(ctx, data);
        break;
      case 'technical_diagram':
        renderTechnicalDiagram(ctx, data);
        break;
      case 'bar_chart':
        renderBarChart(ctx, data);
        break;
      case 'pie_chart':
        renderPieChart(ctx, data);
        break;
      case 'line_graph':
        renderLineGraph(ctx, data);
        break;
      case 'map':
        renderCampusMap(ctx, data); // fallback to campus map
        break;
      default:
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.fillText(`Unknown type: ${data.type}`, 50, 50);
    }
  }, []);

  // ============ CAMPUS MAP RENDERER ============
  const renderCampusMap = (ctx, data) => {
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

  // ============ FLOOR PLAN RENDERER ============
  const renderFloorPlan = (ctx, data) => {
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

  // ============ TECHNICAL DIAGRAM RENDERER ============
  const renderTechnicalDiagram = (ctx, data) => {
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

  // ============ BAR CHART RENDERER ============
  const renderBarChart = (ctx, data) => {
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
  const renderPieChart = (ctx, data) => {
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
  const renderLineGraph = (ctx, data) => {
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

  // ============ EXPORT & SAVE ============
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

  // ============ RENDER UI ============
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
              <Layers className="text-blue-500" />
              IELTS Visual Generator
            </h1>
            <p className="text-slate-600">
              Advanced tool for creating maps, diagrams, charts, and floor plans
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON Input Panel */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Code size={20} />
                    JSON Configuration
                  </h3>
                  <Button onClick={parseJSON} className="bg-blue-500 hover:bg-blue-600">
                    <Eye size={18} className="mr-2" />
                    Generate
                  </Button>
                </div>

                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-72 p-3 font-mono text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste your JSON configuration here..."
                />

                {error && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Example Templates */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Load Template:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => loadExample('campus_map')} className="p-3 bg-white rounded-lg hover:bg-green-50 text-left text-sm border hover:border-green-400 transition">
                    🏫 Campus Map
                  </button>
                  <button onClick={() => loadExample('shopping_floor')} className="p-3 bg-white rounded-lg hover:bg-purple-50 text-left text-sm border hover:border-purple-400 transition">
                    🛒 Shopping Floor
                  </button>
                  <button onClick={() => loadExample('process_diagram')} className="p-3 bg-white rounded-lg hover:bg-orange-50 text-left text-sm border hover:border-orange-400 transition">
                    ⚙️ Technical Diagram
                  </button>
                  <button onClick={() => loadExample('bar_chart')} className="p-3 bg-white rounded-lg hover:bg-blue-50 text-left text-sm border hover:border-blue-400 transition">
                    📊 Bar Chart
                  </button>
                  <button onClick={() => loadExample('pie_chart')} className="p-3 bg-white rounded-lg hover:bg-yellow-50 text-left text-sm border hover:border-yellow-400 transition">
                    🥧 Pie Chart
                  </button>
                  <button onClick={() => loadExample('line_graph')} className="p-3 bg-white rounded-lg hover:bg-red-50 text-left text-sm border hover:border-red-400 transition">
                    📈 Line Graph
                  </button>
                </div>
              </div>

              {/* Save Section */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">Save to Library</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={visualName}
                    onChange={(e) => setVisualName(e.target.value)}
                    placeholder="Visual name (e.g., campus_map_set_c)"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                  <Button onClick={saveVisual} disabled={saving} className="bg-green-600 hover:bg-green-700">
                    <Save size={18} className="mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Visual Output Panel */}
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <ImageIcon size={20} />
                    Preview
                  </h3>
                  <div className="flex gap-2">
                    <Button onClick={() => visualData && renderVisual(visualData)} variant="outline" size="sm">
                      <RefreshCw size={16} className="mr-1" />
                      Refresh
                    </Button>
                    <Button onClick={exportImage} disabled={!visualData} className="bg-emerald-500 hover:bg-emerald-600">
                      <Download size={18} className="mr-2" />
                      Export PNG
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border-2 border-slate-200 p-2 flex items-center justify-center overflow-auto" style={{ minHeight: '500px' }}>
                  {visualData ? (
                    <canvas ref={canvasRef} className="border border-slate-300 rounded max-w-full" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Load a template or paste JSON to generate visual</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Saved Visuals */}
              {savedVisuals.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Saved Visuals ({savedVisuals.length})</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-auto">
                    {savedVisuals.map((v, i) => (
                      <div key={i} className="p-2 bg-white rounded border text-sm truncate flex items-center gap-2">
                        <span className="text-green-500">✓</span>
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
