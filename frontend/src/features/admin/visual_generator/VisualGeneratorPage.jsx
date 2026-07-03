// VisualGeneratorPage — admin Task 1 visual generation tool (route /admin/visual-generator,
// AUTH-gated in App.js). Orchestrator extracted from pages/VisualGenerator.js (Faz1 wave 10);
// body verbatim. The six example templates moved to ./examples.js and the pure (ctx, data)
// canvas renderers to ./renderers/ — none of them close over component state.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Code, Eye, Image as ImageIcon, Save, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { examples } from './examples';
import { renderCampusMap } from './renderers/campusMap';
import { renderFloorPlan } from './renderers/floorPlan';
import { renderTechnicalDiagram } from './renderers/technicalDiagram';
import { renderBarChart, renderPieChart, renderLineGraph } from './renderers/charts';

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
