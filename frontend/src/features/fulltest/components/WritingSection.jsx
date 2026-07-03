import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { ArrowRight } from 'lucide-react';
import { API_URL } from '../constants';

// ============ WRITING SECTION ============
export default function WritingSection({
  testData,
  writingTask,
  setWritingTask,
  wordCount,
  setWordCount,
  sectionAnswers,
  setSectionAnswers,
}) {
  const writing = testData?.sections?.writing;
  const task = writing?.tasks?.[writingTask - 1];

  // Comprehensive visual renderer for all chart types
  const renderVisual = (visualData) => {
    if (!visualData) return null;

    // Before/After comparison - two images side by side
    if (visualData.image_url && visualData.image_url_after) {
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {visualData.before?.label && (
                <p className="text-center text-sm font-semibold text-slate-700 mb-2">{visualData.before.label}</p>
              )}
              <img
                src={`${API_URL}/api/visuals/image/${visualData.image_url.replace('.png', '')}`}
                alt={visualData.before?.label || 'Before'}
                className="w-full rounded border"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              {visualData.after?.label && (
                <p className="text-center text-sm font-semibold text-slate-700 mb-2">{visualData.after.label}</p>
              )}
              <img
                src={`${API_URL}/api/visuals/image/${visualData.image_url_after.replace('.png', '')}`}
                alt={visualData.after?.label || 'After'}
                className="w-full rounded border"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
          {visualData.title && (
            <p className="text-center text-sm text-slate-600 mt-2">{visualData.title}</p>
          )}
        </div>
      );
    }

    // If image URL is provided, render the PNG directly
    if (visualData.image_url) {
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <img
            src={`${API_URL}/api/visuals/image/${visualData.image_url.replace('.png', '')}`}
            alt={visualData.title || 'Visual'}
            className="w-full max-w-2xl mx-auto rounded"
            onError={(e) => {
              e.target.style.display = 'none';
              console.error('Failed to load visual:', visualData.image_url);
            }}
          />
          {visualData.title && (
            <p className="text-center text-sm text-slate-600 mt-2">{visualData.title}</p>
          )}
        </div>
      );
    }

    // Bar Chart
    if (visualData.type === 'bar_chart') {
      const { categories, data, title } = visualData;
      const colors = ['#3B82F6', '#10B981', '#F59E0B'];

      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
          <div className="flex justify-center gap-6 mb-4">
            {data.map((item, idx) => (
              <div key={item.sector} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: colors[idx] }}></div>
                <span className="text-sm text-slate-600">{item.sector}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {categories.map((category, catIdx) => (
              <div key={category} className="flex items-center gap-3">
                <div className="w-28 text-sm text-slate-600 text-right">{category}</div>
                <div className="flex-1 flex gap-1">
                  {data.map((item, idx) => (
                    <div key={item.sector} className="h-6 rounded" style={{ width: `${item.values[catIdx]}%`, backgroundColor: colors[idx], minWidth: item.values[catIdx] > 0 ? '20px' : '0' }}>
                      {item.values[catIdx] > 10 && <span className="text-xs text-white px-1">{item.values[catIdx]}%</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Line Graph
    if (visualData.type === 'line_graph') {
      const { title, datasets, x_labels } = visualData;
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
          <div className="flex justify-center gap-4 mb-4 flex-wrap">
            {datasets?.map((ds) => (
              <div key={ds.country} className="flex items-center gap-2">
                <div className="w-4 h-1" style={{ backgroundColor: ds.color }}></div>
                <span className="text-sm text-slate-600">{ds.country}</span>
              </div>
            ))}
          </div>
          <div className="relative h-64 border-l border-b border-slate-300 ml-8">
            {/* Y-axis labels */}
            <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-xs text-slate-500">
              <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
            </div>
            {/* Data lines visualization */}
            <div className="absolute inset-0 flex items-end justify-around px-2 pb-6">
              {x_labels?.map((year, idx) => (
                <div key={year} className="flex flex-col items-center">
                  {datasets?.map((ds) => (
                    <div
                      key={ds.country}
                      className="w-2 h-2 rounded-full mb-1"
                      style={{
                        backgroundColor: ds.color,
                        marginBottom: `${ds.data[idx] * 2}px`
                      }}
                      title={`${ds.country}: ${ds.data[idx]}%`}
                    />
                  ))}
                  <span className="text-xs text-slate-500 mt-2">{year}</span>
                </div>
              ))}
            </div>
          </div>
          {visualData.visual_description && (
            <p className="text-xs text-slate-500 mt-3 whitespace-pre-wrap">{visualData.visual_description}</p>
          )}
        </div>
      );
    }

    // Process Diagram
    if (visualData.type === 'process') {
      const { title, stages } = visualData;
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
          <div className="flex flex-wrap justify-center gap-2">
            {stages?.map((stage, idx) => (
              <div key={stage.number} className="flex items-center">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center min-w-[120px]">
                  <div className="text-xs text-blue-600 font-medium">Stage {stage.number}</div>
                  <div className="text-sm font-semibold text-slate-800">{stage.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{stage.description}</div>
                </div>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-400 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Pie Chart Comparison
    if (visualData.type === 'pie_chart_comparison') {
      const { title, charts } = visualData;
      const pieColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>
          <div className="grid grid-cols-2 gap-6">
            {charts?.map((chart) => (
              <div key={chart.year} className="text-center">
                <h5 className="font-medium text-slate-700 mb-3">{chart.year}</h5>
                <div className="space-y-2">
                  {chart.data?.map((item, idx) => (
                    <div key={item.reason} className="flex items-center gap-2">
                      <div
                        className="h-4 rounded"
                        style={{
                          width: `${item.percentage * 2}px`,
                          backgroundColor: pieColors[idx % pieColors.length]
                        }}
                      />
                      <span className="text-xs text-slate-600">{item.reason}: {item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Combined charts (bar + table)
    if (visualData.type === 'combined') {
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg space-y-4">
          {visualData.charts?.map((chart, idx) => {
            if (chart.chart_type === 'bar') {
              return (
                <div key={idx}>
                  <h4 className="font-semibold text-center text-slate-900 mb-3">{chart.title}</h4>
                  <div className="space-y-2">
                    {chart.data?.map((row) => (
                      <div key={row.city} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-slate-600 text-right">{row.city}</div>
                        <div className="flex gap-1 flex-1">
                          <div className="h-5 bg-blue-400 rounded" style={{ width: `${row['2010'] * 2}%` }}>
                            <span className="text-xs text-white px-1">{row['2010']}%</span>
                          </div>
                          <div className="h-5 bg-green-400 rounded" style={{ width: `${row['2020'] * 2}%` }}>
                            <span className="text-xs text-white px-1">{row['2020']}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded"></div> 2010</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"></div> 2020</span>
                  </div>
                </div>
              );
            }
            if (chart.chart_type === 'table') {
              return (
                <div key={idx}>
                  <h4 className="font-semibold text-center text-slate-900 mb-3">{chart.title}</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {chart.headers?.map((h) => (
                          <th key={h} className="text-left py-2 px-3 text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chart.data?.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }

    // Fallback: show visual_description if available
    if (visualData.visual_description) {
      return (
        <div className="mt-4 p-4 bg-slate-100 border rounded-lg">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
            {visualData.visual_description}
          </pre>
        </div>
      );
    }

    // Dual Map (for IELTS Writing Task 1 - map comparison)
    if (visualData.type === 'dual_map') {
      const { title, maps } = visualData;
      return (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          {title && <h4 className="font-semibold text-center text-slate-900 mb-4">{title}</h4>}
          <div className="grid grid-cols-2 gap-4">
            {maps?.map((map, mapIdx) => (
              <div key={mapIdx} className="border rounded-lg p-4 bg-slate-50">
                <h5 className="font-medium text-center text-slate-800 mb-3 text-sm">{map.title}</h5>
                <div className="relative bg-white rounded border aspect-[4/3] p-3">
                  {/* River */}
                  <div className="absolute top-2 left-0 right-0 h-6 bg-blue-200 flex items-center justify-center">
                    <span className="text-xs text-blue-700 font-medium">River</span>
                  </div>

                  {/* Farmland */}
                  <div className="absolute top-8 left-0 right-0 h-8 bg-green-100 flex items-center justify-center border-b border-green-300">
                    <span className="text-xs text-green-700">Farmland</span>
                  </div>

                  {/* Main area */}
                  <div className="absolute top-16 bottom-8 left-2 right-2">
                    {/* Road to Town - left */}
                    <div className="absolute left-0 top-1/2 w-8 h-4 bg-gray-300 flex items-center justify-center transform -translate-y-1/2">
                      <span className="text-[8px] text-gray-600">Town</span>
                    </div>

                    {/* Roundabout - center */}
                    <div className="absolute left-1/2 top-1/2 w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-400 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    </div>

                    {/* Buildings/Facilities based on map type */}
                    {mapIdx === 0 ? (
                      // Current map - Factories
                      <>
                        <div className="absolute left-12 top-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                          <span className="text-[8px]">Factory</span>
                        </div>
                        <div className="absolute right-12 top-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                          <span className="text-[8px]">Factory</span>
                        </div>
                        <div className="absolute left-12 bottom-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                          <span className="text-[8px]">Factory</span>
                        </div>
                        <div className="absolute right-12 bottom-2 w-12 h-8 bg-red-200 border border-red-300 flex items-center justify-center">
                          <span className="text-[8px]">Factory</span>
                        </div>
                      </>
                    ) : (
                      // Planned development - Housing and facilities
                      <>
                        {/* Housing */}
                        <div className="absolute left-10 top-1 w-10 h-6 bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                          <span className="text-[7px]">Housing</span>
                        </div>
                        <div className="absolute right-10 top-1 w-10 h-6 bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                          <span className="text-[7px]">Housing</span>
                        </div>
                        <div className="absolute left-10 bottom-1 w-10 h-6 bg-yellow-100 border border-yellow-300 flex items-center justify-center">
                          <span className="text-[7px]">Housing</span>
                        </div>

                        {/* Medical Centre - south of roundabout */}
                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-14 h-5 bg-red-100 border border-red-300 flex items-center justify-center">
                          <span className="text-[6px]">Medical</span>
                        </div>

                        {/* Shops - east of roundabout */}
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-6 bg-purple-100 border border-purple-300 flex items-center justify-center">
                          <span className="text-[7px]">Shops</span>
                        </div>

                        {/* School - far east */}
                        <div className="absolute right-0 top-2 w-8 h-5 bg-blue-100 border border-blue-300 flex items-center justify-center">
                          <span className="text-[6px]">School</span>
                        </div>

                        {/* Playground */}
                        <div className="absolute right-1 bottom-8 w-8 h-5 bg-green-200 border border-green-400 flex items-center justify-center">
                          <span className="text-[6px]">Play</span>
                        </div>

                        {/* New Bridge */}
                        <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-6 h-3 bg-gray-400 flex items-center justify-center">
                          <span className="text-[5px] text-white">Bridge</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Main Road - bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-600">Main Road</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left - Task */}
      <div className="w-1/2 border-r border-slate-300 overflow-auto bg-white p-6">
        <div className="flex gap-2 mb-4">
          <button onClick={() => setWritingTask(1)} className={`px-4 py-2 rounded ${writingTask === 1 ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>
            Task 1 (20 min)
          </button>
          <button onClick={() => setWritingTask(2)} className={`px-4 py-2 rounded ${writingTask === 2 ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>
            Task 2 (40 min)
          </button>
        </div>

        <h2 className="text-xl font-bold mb-4">Task {writingTask}</h2>
        <p className="text-slate-700 whitespace-pre-wrap mb-4">{task?.prompt}</p>
        {task?.visual_data && renderVisual(task.visual_data)}

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
          <strong>Word limit:</strong> Minimum {task?.word_limit?.min} words
        </div>
      </div>

      {/* Right - Writing Area */}
      <div className="w-1/2 overflow-auto bg-slate-50 p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600">Your Response</span>
          <Badge className={wordCount[`task${writingTask}`] >= (task?.word_limit?.min || 150) ? 'bg-green-500' : 'bg-slate-400'}>
            {wordCount[`task${writingTask}`]} words
          </Badge>
        </div>
        <Textarea
          className="min-h-[500px] text-sm bg-white"
          placeholder="Write your response here..."
          value={sectionAnswers.writing[`task${writingTask}`]}
          onChange={(e) => {
            const text = e.target.value;
            setSectionAnswers(prev => ({
              ...prev,
              writing: { ...prev.writing, [`task${writingTask}`]: text }
            }));
            setWordCount(prev => ({
              ...prev,
              [`task${writingTask}`]: text.trim().split(/\s+/).filter(Boolean).length
            }));
          }}
        />
      </div>
    </div>
  );
}
