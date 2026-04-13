import React from 'react';

/**
 * IELTS-Style Campus Map Component
 * Renders a detailed SVG map for Westbrook University Campus
 * Used in Academic Set C Listening Part 1
 */

export default function CampusMap({ title = "Westbrook University Campus Map" }) {
  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg overflow-hidden">
      {/* Title */}
      <div className="p-3 bg-slate-100 border-b border-slate-300">
        <h3 className="text-center font-bold text-lg text-slate-800">{title}</h3>
        <p className="text-center text-sm text-slate-600">Map showing campus buildings. Label the buildings marked A-G.</p>
      </div>
      
      {/* SVG Map */}
      <div className="p-4 bg-white">
        <svg viewBox="0 0 500 400" className="w-full h-auto" style={{ maxHeight: '450px' }}>
          {/* Background */}
          <rect x="0" y="0" width="500" height="400" fill="#f5f5dc" />
          
          {/* Main Road - horizontal */}
          <path d="M 0 300 L 500 300" stroke="#888" strokeWidth="20" fill="none" />
          <path d="M 0 300 L 500 300" stroke="#aaa" strokeWidth="2" strokeDasharray="10,10" fill="none" />
          <text x="250" y="318" textAnchor="middle" fontSize="10" fill="#555">Main Campus Road</text>
          
          {/* Entrance Path from Main Road */}
          <path d="M 250 300 L 250 380" stroke="#888" strokeWidth="15" fill="none" />
          <path d="M 250 300 L 250 380" stroke="#aaa" strokeWidth="2" strokeDasharray="8,8" fill="none" />
          
          {/* West Path */}
          <path d="M 50 200 L 150 200" stroke="#999" strokeWidth="8" fill="none" />
          
          {/* Internal Paths */}
          <path d="M 150 100 L 150 280 M 350 100 L 350 280" stroke="#ccc" strokeWidth="4" strokeDasharray="5,5" fill="none" />
          <path d="M 100 180 L 400 180" stroke="#ccc" strokeWidth="4" strokeDasharray="5,5" fill="none" />
          
          {/* Central Lawn - green area */}
          <ellipse cx="250" cy="200" rx="60" ry="40" fill="#90EE90" stroke="#228B22" strokeWidth="2" />
          <text x="250" y="205" textAnchor="middle" fontSize="11" fill="#006400" fontWeight="bold">Central Lawn</text>
          
          {/* Trees around lawn */}
          {[{x: 180, y: 170}, {x: 320, y: 170}, {x: 180, y: 230}, {x: 320, y: 230}].map((pos, i) => (
            <g key={i} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle r="8" fill="#228B22" />
              <circle r="5" cy="-3" fill="#32CD32" />
            </g>
          ))}
          
          {/* ========== BUILDINGS ========== */}
          
          {/* Building A - Administration (large, central-south) */}
          <rect x="215" y="250" width="70" height="35" fill="#d4a574" stroke="#8B4513" strokeWidth="2" />
          <rect x="225" y="255" width="15" height="20" fill="#4a90d9" opacity="0.7" /> {/* window */}
          <rect x="250" y="255" width="15" height="20" fill="#4a90d9" opacity="0.7" /> {/* window */}
          <circle cx="250" cy="250" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
          <text x="250" y="254" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">A</text>
          
          {/* Building B - Science Complex (west, modern glass) */}
          <rect x="60" y="130" width="55" height="45" fill="#87CEEB" stroke="#4682B4" strokeWidth="2" />
          <line x1="70" y1="130" x2="70" y2="175" stroke="#4682B4" strokeWidth="1" />
          <line x1="85" y1="130" x2="85" y2="175" stroke="#4682B4" strokeWidth="1" />
          <line x1="100" y1="130" x2="100" y2="175" stroke="#4682B4" strokeWidth="1" />
          {/* Solar panels on roof */}
          <rect x="65" y="120" width="20" height="8" fill="#1a1a4e" stroke="#333" strokeWidth="1" />
          <rect x="90" y="120" width="20" height="8" fill="#1a1a4e" stroke="#333" strokeWidth="1" />
          <circle cx="88" cy="115" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
          <text x="88" y="119" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">B</text>
          
          {/* Building C - Main Library (north-center) */}
          <rect x="200" y="60" width="100" height="50" fill="#deb887" stroke="#8B4513" strokeWidth="2" />
          <rect x="210" y="70" width="20" height="30" fill="#4a90d9" opacity="0.6" />
          <rect x="240" y="70" width="20" height="30" fill="#4a90d9" opacity="0.6" />
          <rect x="270" y="70" width="20" height="30" fill="#4a90d9" opacity="0.6" />
          {/* Library entrance columns */}
          <rect x="235" y="105" width="8" height="12" fill="#d4a574" />
          <rect x="257" y="105" width="8" height="12" fill="#d4a574" />
          <circle cx="250" cy="50" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
          <text x="250" y="54" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">C</text>
          
          {/* Building D - Student Union (east of library) */}
          <rect x="340" y="70" width="60" height="40" fill="#f4a460" stroke="#D2691E" strokeWidth="2" />
          <rect x="350" y="80" width="40" height="8" fill="#fff" opacity="0.5" /> {/* sign */}
          <circle cx="370" cy="60" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
          <text x="370" y="64" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">D</text>
          
          {/* Building E - Engineering Faculty (east, tall tower) */}
          <rect x="400" y="120" width="45" height="80" fill="#b8860b" stroke="#8B6914" strokeWidth="2" />
          {/* Tower windows */}
          {[0, 1, 2, 3, 4].map(i => (
            <rect key={i} x="410" y={130 + i * 15} width="25" height="10" fill="#4a90d9" opacity="0.6" />
          ))}
          <circle cx="422" cy="110" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
          <text x="422" y="114" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">E</text>
          
          {/* Building F - Planetarium (dome shaped, behind E) */}
          <ellipse cx="420" cy="230" rx="25" ry="15" fill="#708090" stroke="#4a5568" strokeWidth="2" />
          <path d="M 395 230 Q 420 200 445 230" fill="#708090" stroke="#4a5568" strokeWidth="2" />
          <circle cx="420" cy="215" r="5" fill="#fffacd" /> {/* dome light */}
          <circle cx="420" cy="250" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
          <text x="420" y="254" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">F</text>
          
          {/* Building G - Sports Centre (northeast) */}
          <rect x="380" y="20" width="80" height="35" fill="#20B2AA" stroke="#008B8B" strokeWidth="2" />
          <path d="M 385 30 L 405 20 L 425 30 L 445 20 L 455 30" stroke="#fff" strokeWidth="2" fill="none" /> {/* wave pattern for pool */}
          <circle cx="420" cy="10" r="12" fill="#fff" stroke="#333" strokeWidth="2" />
          <text x="420" y="14" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#333">G</text>
          
          {/* Main Entrance */}
          <rect x="230" y="365" width="40" height="25" fill="#8B4513" stroke="#5D3A1A" strokeWidth="2" />
          <text x="250" y="395" textAnchor="middle" fontSize="10" fill="#333" fontWeight="bold">MAIN ENTRANCE</text>
          
          {/* Compass */}
          <g transform="translate(460, 40)">
            <circle r="25" fill="#fff" stroke="#333" strokeWidth="1" />
            <text x="0" y="-12" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">N</text>
            <text x="0" y="18" textAnchor="middle" fontSize="10" fill="#666">S</text>
            <text x="-14" y="4" textAnchor="middle" fontSize="10" fill="#666">W</text>
            <text x="14" y="4" textAnchor="middle" fontSize="10" fill="#666">E</text>
            <polygon points="0,-8 3,0 0,8 -3,0" fill="#333" />
            <polygon points="0,8 3,0 0,-8 -3,0" fill="#999" />
          </g>
          
          {/* Scale */}
          <g transform="translate(30, 380)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#333" strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#333" strokeWidth="2" />
            <line x1="60" y1="-5" x2="60" y2="5" stroke="#333" strokeWidth="2" />
            <text x="30" y="15" textAnchor="middle" fontSize="9" fill="#333">100 metres</text>
          </g>
          
          {/* Key */}
          <g transform="translate(380, 340)">
            <rect x="0" y="0" width="110" height="50" fill="#fff" stroke="#333" strokeWidth="1" />
            <text x="55" y="12" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#333">Key</text>
            <rect x="5" y="18" width="12" height="8" fill="#d4a574" stroke="#8B4513" strokeWidth="1" />
            <text x="22" y="25" fontSize="8" fill="#333">Building</text>
            <circle cx="11" cy="40" r="6" fill="#228B22" />
            <text x="22" y="43" fontSize="8" fill="#333">Trees</text>
            <line x1="60" y1="22" x2="80" y2="22" stroke="#888" strokeWidth="4" />
            <text x="85" y="25" fontSize="8" fill="#333">Road</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Generic Estate/Town Map Component
 * For maps like housing estates, towns with streets
 */
export function TownMap({ visual, title }) {
  const elements = visual?.elements || [];
  
  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg overflow-hidden">
      <div className="p-3 bg-slate-100 border-b border-slate-300">
        <h3 className="text-center font-bold text-lg text-slate-800">{title || visual?.title}</h3>
      </div>
      
      <div className="p-4">
        <svg viewBox="0 0 500 400" className="w-full h-auto" style={{ maxHeight: '450px' }}>
          <rect x="0" y="0" width="500" height="400" fill="#f9f9f0" />
          
          {/* Render roads */}
          {visual?.roads?.map((road, i) => (
            <g key={`road-${i}`}>
              <path d={road.path} stroke="#888" strokeWidth={road.width || 15} fill="none" />
              <path d={road.path} stroke="#ddd" strokeWidth="2" strokeDasharray="10,10" fill="none" />
              {road.name && (
                <text x={road.labelX} y={road.labelY} fontSize="9" fill="#555" transform={road.labelRotate}>
                  {road.name}
                </text>
              )}
            </g>
          ))}
          
          {/* Render elements */}
          {elements.map((el, i) => (
            <g key={i} transform={`translate(${el.position?.x * 5 || 0}, ${el.position?.y * 4 || 0})`}>
              {el.type === 'building' && (
                <>
                  <rect x="-20" y="-15" width="40" height="30" fill="#deb887" stroke="#8B4513" strokeWidth="2" />
                  {!el.given && (
                    <>
                      <circle r="12" fill="#fff" stroke="#333" strokeWidth="2" />
                      <text textAnchor="middle" dy="4" fontSize="14" fontWeight="bold" fill="#333">{el.id}</text>
                    </>
                  )}
                  {el.given && el.label && (
                    <text textAnchor="middle" dy="4" fontSize="9" fill="#333">{el.label}</text>
                  )}
                </>
              )}
              {el.type === 'lake' && (
                <>
                  <ellipse rx="30" ry="20" fill="#87CEEB" stroke="#4682B4" strokeWidth="2" />
                  <text textAnchor="middle" dy="4" fontSize="9" fill="#333">{el.label}</text>
                </>
              )}
              {el.type === 'trees' && (
                <g>
                  <circle r="8" fill="#228B22" />
                  <circle r="6" cx="-8" cy="5" fill="#228B22" />
                  <circle r="6" cx="8" cy="5" fill="#228B22" />
                </g>
              )}
            </g>
          ))}
          
          {/* Compass */}
          <g transform="translate(460, 40)">
            <circle r="20" fill="#fff" stroke="#333" strokeWidth="1" />
            <text x="0" y="-8" textAnchor="middle" fontSize="10" fontWeight="bold">N</text>
            <text x="0" y="14" textAnchor="middle" fontSize="8" fill="#666">S</text>
            <text x="-10" y="3" textAnchor="middle" fontSize="8" fill="#666">W</text>
            <text x="10" y="3" textAnchor="middle" fontSize="8" fill="#666">E</text>
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Shopping Centre Floor Plan Component  
 * For multi-floor maps like General Set C
 */
export function FloorPlanMap({ visual, title }) {
  const floors = visual?.floors || [];
  
  return (
    <div className="bg-white border-2 border-slate-400 rounded-lg overflow-hidden">
      <div className="p-3 bg-slate-100 border-b border-slate-300">
        <h3 className="text-center font-bold text-lg text-slate-800">{title || visual?.title}</h3>
      </div>
      
      <div className="p-4 space-y-4">
        {floors.map((floor, floorIdx) => (
          <div key={floorIdx} className="border border-slate-300 rounded">
            <div className="px-3 py-1 bg-slate-50 border-b text-sm font-medium text-slate-700">
              {floor.level}
            </div>
            <svg viewBox="0 0 400 150" className="w-full h-auto">
              <rect x="0" y="0" width="400" height="150" fill="#fafaf0" />
              
              {/* Floor outline */}
              <rect x="20" y="20" width="360" height="110" fill="none" stroke="#666" strokeWidth="2" />
              
              {/* Render elements */}
              {floor.elements?.map((el, i) => {
                const x = (el.position?.x / 100) * 360 + 20;
                const y = (el.position?.y / 100) * 110 + 20;
                
                return (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    {(el.type === 'shop' || el.type === 'cafe' || el.type === 'department_store') && (
                      <rect x="-25" y="-12" width="50" height="24" fill={el.given ? "#e8e8e8" : "#ffe4b5"} stroke="#666" strokeWidth="1" />
                    )}
                    {el.type === 'entrance' && (
                      <rect x="-20" y="-8" width="40" height="16" fill="#90EE90" stroke="#228B22" strokeWidth="1" />
                    )}
                    {el.type === 'feature' && (
                      <circle r="15" fill="#87CEEB" stroke="#4682B4" strokeWidth="1" />
                    )}
                    {el.type === 'escalator' && (
                      <rect x="-15" y="-8" width="30" height="16" fill="#dda0dd" stroke="#666" strokeWidth="1" />
                    )}
                    {el.type === 'lift' && (
                      <rect x="-10" y="-10" width="20" height="20" fill="#b0c4de" stroke="#666" strokeWidth="1" />
                    )}
                    
                    {/* Label */}
                    {el.given ? (
                      <text textAnchor="middle" dy="4" fontSize="8" fill="#333">{el.label}</text>
                    ) : (
                      <>
                        <circle r="10" fill="#fff" stroke="#333" strokeWidth="2" />
                        <text textAnchor="middle" dy="4" fontSize="12" fontWeight="bold" fill="#333">{el.id}</text>
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
