import React from 'react';

// This is a DEMO/MOCKUP page showing the recommended competitor features
// These are NOT functional - just visual examples for the product owner

const FeatureShowcase = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-violet-700">
          🎯 Recommended Features from Competitors
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Bu sayfa, rakip IELTS platformlarından önerilen özelliklerin görsel demo'larını gösterir.
        </p>

        {/* Feature 1: Question Navigation Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">HIGH PRIORITY</span>
            <h2 className="text-xl font-bold text-gray-800">1. Question Navigation Bar (1-40)</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Ne yapar:</strong> Ekranın üstünde 1-40 arası numaralı kutucuklar gösterir. 
            Kullanıcı herhangi bir soruya tıklayarak direkt atlayabilir. 
            Cevaplanmış/cevaplanmamış sorular farklı renklerle gösterilir.
          </p>
          
          {/* Demo UI */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">📍 Demo - Question Palette:</div>
            <div className="flex flex-wrap gap-1 justify-center">
              {Array.from({ length: 40 }, (_, i) => {
                const num = i + 1;
                let bgColor = 'bg-gray-200 hover:bg-gray-300'; // Unanswered
                let textColor = 'text-gray-600';
                
                // Demo: Some answered (green), some flagged (yellow), some unanswered (gray)
                if ([1, 2, 3, 5, 6, 8, 9, 10, 12, 15, 18, 20, 22, 25].includes(num)) {
                  bgColor = 'bg-green-500 hover:bg-green-600';
                  textColor = 'text-white';
                } else if ([4, 11, 16, 23].includes(num)) {
                  bgColor = 'bg-yellow-400 hover:bg-yellow-500';
                  textColor = 'text-gray-800';
                } else if (num === 7) {
                  bgColor = 'bg-violet-600 hover:bg-violet-700';
                  textColor = 'text-white';
                }
                
                return (
                  <button
                    key={num}
                    className={`w-8 h-8 ${bgColor} ${textColor} rounded text-sm font-medium 
                      transition-colors cursor-pointer flex items-center justify-center
                      ${num === 7 ? 'ring-2 ring-violet-300' : ''}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Cevaplandı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>İşaretlendi (Flagged)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Cevaplanmadı</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-violet-600 rounded"></div>
                <span>Şu anki soru</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <strong className="text-blue-800">💡 Avantajları:</strong>
            <ul className="text-blue-700 text-sm mt-1 list-disc list-inside">
              <li>Kullanıcı hangi soruları atladığını hemen görür</li>
              <li>Zaman yönetimi kolaylaşır</li>
              <li>Gerçek IELTS deneyimine yakın</li>
            </ul>
          </div>
        </div>

        {/* Feature 2: Side-by-Side View */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">HIGH PRIORITY</span>
            <h2 className="text-xl font-bold text-gray-800">2. Side-by-Side Passage View</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Ne yapar:</strong> Reading testinde pasaj sol tarafta, sorular sağ tarafta yan yana gösterilir.
            Gerçek IELTS sınavındaki gibi iki kağıdı yan yana koymuş gibi çalışabilirsiniz.
          </p>
          
          {/* Demo UI */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">📍 Demo - Side-by-Side Layout:</div>
            <div className="grid grid-cols-2 gap-4">
              {/* Left: Passage */}
              <div className="bg-white rounded-lg p-4 border shadow-sm h-64 overflow-y-auto">
                <h3 className="font-bold text-lg mb-2 text-gray-800">READING PASSAGE</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="bg-yellow-200">The Industrial Revolution</span> was the transition 
                  to new manufacturing processes in Europe and the United States, in the period from 
                  about 1760 to sometime between 1820 and 1840. This transition included going from 
                  hand production methods to machines, new chemical manufacturing and iron production 
                  processes, the increasing use of steam power and water power...
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mt-2">
                  The development of trade and the rise of business were among the major causes of 
                  the Industrial Revolution. The textile industry was also the first to use modern 
                  production methods...
                </p>
                <p className="text-xs text-gray-400 mt-4 italic">
                  (Scroll to read more...)
                </p>
              </div>
              
              {/* Right: Questions */}
              <div className="bg-white rounded-lg p-4 border shadow-sm h-64 overflow-y-auto">
                <h3 className="font-bold text-lg mb-2 text-gray-800">QUESTIONS 1-13</h3>
                <div className="space-y-3">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium">Question 1</p>
                    <p className="text-sm text-gray-600">What period did the Industrial Revolution occur?</p>
                    <input 
                      type="text" 
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      placeholder="Type your answer..."
                    />
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="text-sm font-medium">Question 2</p>
                    <p className="text-sm text-gray-600">Which industry first used modern production?</p>
                    <input 
                      type="text" 
                      className="mt-1 w-full border rounded px-2 py-1 text-sm"
                      placeholder="Type your answer..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <strong className="text-blue-800">💡 Avantajları:</strong>
            <ul className="text-blue-700 text-sm mt-1 list-disc list-inside">
              <li>Pasaj ve sorular aynı anda görülür - sürekli scroll yapmaya gerek yok</li>
              <li>Gerçek IELTS sınav deneyimi (iki kağıt yan yana)</li>
              <li>Cevap ararken pasajda highlight yapılabilir</li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Locate & Explain */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">HIGH PRIORITY</span>
            <h2 className="text-xl font-bold text-gray-800">3. "Locate & Explain" Feature</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Ne yapar:</strong> Test bittikten sonra, her cevap için pasajın neresinde bulunduğunu
            ve NEDEN doğru olduğunu detaylı açıklar. Öğrenme değeri çok yüksek!
          </p>
          
          {/* Demo UI */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">📍 Demo - After Test Results:</div>
            
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">✓ CORRECT</span>
                <span className="font-bold">Question 5</span>
              </div>
              
              <p className="text-gray-700 mb-3">
                <strong>Question:</strong> What was the main cause of the Industrial Revolution?
              </p>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">📍 Located in passage:</p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
                    "...<mark className="bg-yellow-300">The development of trade and the rise of business 
                    were among the major causes</mark> of the Industrial Revolution..."
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">💡 Explanation:</p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
                    The passage explicitly states that "trade and business" were "major causes." 
                    This is a direct statement question - look for keywords like "cause," "reason," 
                    or "led to" when answering similar questions.
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-purple-50 rounded">
                <p className="text-sm text-purple-800">
                  <strong>🎓 Skill Tip:</strong> For "cause/effect" questions, scan for signal words: 
                  because, due to, as a result, led to, caused by, etc.
                </p>
              </div>
            </div>
            
            {/* Incorrect answer example */}
            <div className="bg-white rounded-lg p-4 border shadow-sm mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">✗ INCORRECT</span>
                <span className="font-bold">Question 8</span>
              </div>
              
              <p className="text-gray-700 mb-2">
                <strong>Your answer:</strong> <span className="text-red-600 line-through">steam power</span>
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Correct answer:</strong> <span className="text-green-600 font-bold">textile industry</span>
              </p>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm mb-3">
                "...<mark className="bg-yellow-300">The textile industry was also the first to use 
                modern production methods</mark>..."
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-800">
                <strong>Why you got it wrong:</strong> "Steam power" is mentioned in the passage but 
                as a power source, not as the first industry. The question specifically asked which 
                INDUSTRY was first - read questions carefully!
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <strong className="text-blue-800">💡 Avantajları:</strong>
            <ul className="text-blue-700 text-sm mt-1 list-disc list-inside">
              <li>Sadece doğru/yanlış değil, NEDEN olduğunu öğrenirsiniz</li>
              <li>Aynı hataları tekrar yapmazsınız</li>
              <li>IELTS soru tiplerini daha iyi anlarsınız</li>
              <li>Rakiplerden çok fark yaratan bir özellik!</li>
            </ul>
          </div>
        </div>

        {/* Feature 4: Enhanced Progress Analytics */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-yellow-500">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">MEDIUM PRIORITY</span>
            <h2 className="text-xl font-bold text-gray-800">4. Enhanced Progress Analytics</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Ne yapar:</strong> Kullanıcının zaman içindeki gelişimini grafiklerle gösterir.
            Hangi soru tiplerinde zayıf olduğunu, band skorunun nasıl değiştiğini takip eder.
          </p>
          
          {/* Demo UI */}
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-2">📍 Demo - Analytics Dashboard:</div>
            
            <div className="grid grid-cols-3 gap-4">
              {/* Overall Score */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Overall Band Score</h4>
                <div className="text-4xl font-bold text-violet-600 mt-1">6.5</div>
                <p className="text-xs text-green-600 mt-1">↑ 0.5 from last month</p>
              </div>
              
              {/* Tests Completed */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Tests Completed</h4>
                <div className="text-4xl font-bold text-blue-600 mt-1">24</div>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>
              
              {/* Study Time */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Study Time</h4>
                <div className="text-4xl font-bold text-green-600 mt-1">18h</div>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>
            </div>
            
            {/* Skills Breakdown */}
            <div className="bg-white rounded-lg p-4 border shadow-sm mt-4">
              <h4 className="font-medium text-gray-800 mb-3">Skills Breakdown</h4>
              <div className="space-y-3">
                {[
                  { skill: 'Listening', score: 7.0, color: 'bg-blue-500' },
                  { skill: 'Reading', score: 6.5, color: 'bg-green-500' },
                  { skill: 'Writing', score: 6.0, color: 'bg-yellow-500' },
                  { skill: 'Speaking', score: 6.5, color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.skill} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600">{item.skill}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div 
                        className={`${item.color} h-4 rounded-full`}
                        style={{ width: `${(item.score / 9) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-800 w-10">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Weak Areas */}
            <div className="bg-white rounded-lg p-4 border shadow-sm mt-4">
              <h4 className="font-medium text-gray-800 mb-3">⚠️ Areas to Improve</h4>
              <div className="flex flex-wrap gap-2">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  True/False/Not Given (58%)
                </span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm">
                  Matching Headings (62%)
                </span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                  Sentence Completion (68%)
                </span>
              </div>
            </div>
            
            {/* Band Score Trend (simplified chart) */}
            <div className="bg-white rounded-lg p-4 border shadow-sm mt-4">
              <h4 className="font-medium text-gray-800 mb-3">📈 Band Score Trend (Last 4 Weeks)</h4>
              <div className="flex items-end justify-around h-32 border-b border-gray-200">
                {[
                  { week: 'W1', score: 5.5 },
                  { week: 'W2', score: 6.0 },
                  { week: 'W3', score: 5.5 },
                  { week: 'W4', score: 6.5 },
                ].map((item) => (
                  <div key={item.week} className="flex flex-col items-center">
                    <div 
                      className="w-12 bg-violet-500 rounded-t"
                      style={{ height: `${(item.score / 9) * 100}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1">{item.week}</span>
                    <span className="text-xs font-bold">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <strong className="text-blue-800">💡 Avantajları:</strong>
            <ul className="text-blue-700 text-sm mt-1 list-disc list-inside">
              <li>Motivasyon: Gelişimi görsel olarak takip etmek motivasyon verir</li>
              <li>Zayıf noktaları tespit eder - neye çalışmanız gerektiğini gösterir</li>
              <li>Hedef belirleme: "Bu ay 7.0'a çıkacağım" gibi hedefler koyabilirsiniz</li>
            </ul>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-4">📋 Özet - Önerilen Özellikler</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-bold text-red-200">🔴 High Priority</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>1. Question Navigation Bar (1-40)</li>
                <li>2. Side-by-Side Passage View</li>
                <li>3. "Locate & Explain" Feature</li>
              </ul>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-bold text-yellow-200">🟡 Medium Priority</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>4. Enhanced Progress Analytics</li>
                <li>5. Vocabulary & Grammar Modules</li>
                <li>6. Dark Mode</li>
              </ul>
            </div>
          </div>
          <p className="text-sm mt-4 text-violet-200">
            Bu özellikleri uygulamak ister misiniz? Hangisinden başlamamı istersiniz?
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureShowcase;
