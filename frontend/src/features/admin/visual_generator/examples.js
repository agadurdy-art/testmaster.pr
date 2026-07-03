// examples — the six JSON template strings for the Visual Generator, verbatim from
// pages/VisualGenerator.js lines 28-277 (Faz1 wave 10). Pure static data, no closures.
  // ============ EXAMPLE TEMPLATES ============
export const examples = {
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
