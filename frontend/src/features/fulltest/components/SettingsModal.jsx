import React from 'react';
import { Settings } from 'lucide-react';

// Settings Modal - IELTS Style
export default function SettingsModal({
  textSize,
  setTextSize,
  colorTheme,
  setColorTheme,
  screenResolution,
  setScreenResolution,
  setShowSettings,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">Settings</span>
          <button
            onClick={() => setShowSettings(false)}
            className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-slate-50">
          <p className="text-slate-600 mb-6">
            If you wish, you can change these settings to make the test easier to read.
          </p>

          <div className="grid grid-cols-3 gap-8">
            {/* Text Size */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Text size</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="textSize"
                    checked={textSize === 'standard'}
                    onChange={() => setTextSize('standard')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">Standard</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="textSize"
                    checked={textSize === 'large'}
                    onChange={() => setTextSize('large')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">Large</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="textSize"
                    checked={textSize === 'extra-large'}
                    onChange={() => setTextSize('extra-large')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">Extra large</span>
                </label>
              </div>
            </div>

            {/* Colours */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Colours</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorTheme"
                    checked={colorTheme === 'standard'}
                    onChange={() => setColorTheme('standard')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">Standard</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorTheme"
                    checked={colorTheme === 'yellow-on-black'}
                    onChange={() => setColorTheme('yellow-on-black')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">Yellow on black</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorTheme"
                    checked={colorTheme === 'blue-on-white'}
                    onChange={() => setColorTheme('blue-on-white')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">Blue on white</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorTheme"
                    checked={colorTheme === 'blue-on-cream'}
                    onChange={() => setColorTheme('blue-on-cream')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">Blue on cream</span>
                </label>
              </div>
            </div>

            {/* Screen Resolution */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Screen Resolution</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="screenRes"
                    checked={screenResolution === '800x600'}
                    onChange={() => setScreenResolution('800x600')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">800 x 600</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="screenRes"
                    checked={screenResolution === '1024x768'}
                    onChange={() => setScreenResolution('1024x768')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">1024 x 768</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="screenRes"
                    checked={screenResolution === '1280x1024'}
                    onChange={() => setScreenResolution('1280x1024')}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-slate-700">1280 x 1024</span>
                </label>
              </div>
            </div>
          </div>

          {/* OK Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowSettings(false)}
              className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
