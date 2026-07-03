import React from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { BookOpen, Filter, Zap, Play, Shuffle } from 'lucide-react';
import { skillIcons } from '../constants';

const practiceModesConfig = [
  {
    id: 'random',
    name: 'Quick Practice',
    icon: Shuffle,
    description: '3 questions per set, swipe through like Shorts',
    color: 'from-indigo-500 to-purple-600',
    badge: 'Shorts'
  }
];

export default function PracticeTab({
  skills,
  topics,
  bandLevels,
  selectedSkill,
  setSelectedSkill,
  selectedTopic,
  setSelectedTopic,
  selectedBand,
  setSelectedBand,
  startPractice,
}) {
  return (
    <div className="space-y-8">
      {/* Skill Selection */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" /> Select Skill
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {skills.map(skill => {
            const Icon = skillIcons[skill.id] || BookOpen;
            const isSelected = selectedSkill === skill.id;
            return (
              <Button
                key={skill.id}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedSkill(skill.id)}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${
                  isSelected ? 'bg-emerald-600 hover:bg-emerald-700' : ''
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm">{skill.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Practice Modes */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Practice Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {practiceModesConfig.map(mode => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.id}
                className="p-6 cursor-pointer hover:shadow-xl transition-all border-0 shadow-lg overflow-hidden relative group"
                onClick={() => startPractice(mode.id, selectedSkill)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <Badge className="mb-3 bg-white/80 text-gray-700">{mode.badge}</Badge>
                <div className={`w-14 h-14 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{mode.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{mode.description}</p>
                <Button className={`w-full bg-gradient-to-r ${mode.color} border-0`}>
                  <Play className="w-4 h-4 mr-2" /> Start
                </Button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Active Filters */}
      {(selectedSkill || selectedTopic || selectedBand) && (
        <div className="p-4 bg-indigo-50 rounded-xl">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active Filters:</span>
            {selectedSkill && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedSkill(null)}>
                {skills.find(s => s.id === selectedSkill)?.name} ✕
              </Badge>
            )}
            {selectedTopic && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTopic(null)}>
                {topics.find(t => t.id === selectedTopic)?.name} ✕
              </Badge>
            )}
            {selectedBand && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedBand(null)}>
                {bandLevels.find(b => b.id === selectedBand)?.name} ✕
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
