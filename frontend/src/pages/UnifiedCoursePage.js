import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Rocket, Star, TrendingUp, Plane, BookOpen, Award, Target, Crown,
  ChevronRight, Lock, CheckCircle, Flame, Trophy, Zap,
  Home, ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Stage icons mapping
const STAGE_ICONS = {
  'rocket': Rocket,
  'star': Star,
  'trending-up': TrendingUp,
  'plane': Plane,
  'book': BookOpen,
  'award': Award,
  'target': Target,
  'crown': Crown
};

// Stage card component - iOS 26 Glass Style
function StageCard({ stage, isUnlocked, progress, onClick }) {
  const Icon = STAGE_ICONS[stage.icon] || Rocket;
  const completionPercent = progress ? Math.round((progress.lessons_completed / progress.total_lessons) * 100) : 0;
  
  return (
    <div 
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl rounded-3xl ${
        isUnlocked ? 'opacity-100' : 'opacity-60'
      }`}
      style={{ 
        background: 'rgba(255, 255, 255, 0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `2px solid ${stage.color}40`,
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07)'
      }}
      onClick={() => onClick(stage)}
      data-testid={`stage-card-${stage.number}`}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ background: `linear-gradient(135deg, ${stage.color} 0%, transparent 60%)` }}
      />
      
      <div className="relative p-6">
        {/* Lock overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center z-10 rounded-3xl backdrop-blur-sm gap-2">
            <Lock className="w-10 h-10 text-white" />
            <span className="text-white text-sm font-medium">Upgrade to Explorer</span>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: stage.color }}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          <Badge 
            variant="outline" 
            className="text-xs font-medium rounded-full px-3"
            style={{ borderColor: stage.color, color: stage.color, background: `${stage.color}10` }}
          >
            {stage.cefr_level}
          </Badge>
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          Stage {stage.number}: {stage.name}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {stage.description}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>{stage.total_units} Units</span>
          <span>•</span>
          <span>{stage.total_units * stage.lessons_per_unit} Lessons</span>
        </div>
        
        {/* Progress bar */}
        {isUnlocked && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium" style={{ color: stage.color }}>{completionPercent}%</span>
            </div>
            <div className="h-2 bg-gray-100/80 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${completionPercent}%`,
                  backgroundColor: stage.color
                }}
              />
            </div>
          </div>
        )}
        
        {/* Action */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: stage.color }}>
            {isUnlocked ? (completionPercent > 0 ? 'Continue' : 'Start') : 'Locked'}
          </span>
          <ChevronRight className="w-5 h-5" style={{ color: stage.color }} />
        </div>
      </div>
    </div>
  );
}

// Header with gamification - iOS 26 Glass Style
function GamificationHeader({ userProgress }) {
  return (
    <div 
      className="sticky top-0 z-40"
      style={{
        background: 'rgba(255, 255, 255, 0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.50)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Testmaster</h1>
              <p className="text-xs text-gray-500">Complete English Program</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6">
            {/* Streak */}
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(251, 146, 60, 0.15)' }}
              >
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="font-bold text-gray-900">{userProgress?.daily_streak || 0}</span>
            </div>
            
            {/* Points */}
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(139, 92, 246, 0.15)' }}
              >
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <span className="font-bold text-gray-900">
                {(userProgress?.total_points || 0).toLocaleString()}
              </span>
            </div>
            
            {/* Rank */}
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(250, 204, 21, 0.15)' }}
              >
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <span className="font-bold text-gray-900">
                #{userProgress?.global_rank || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedCoursePage({ user }) {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load stages
      const stagesRes = await fetch(`${API_URL}/api/unified/stages`);
      const stagesData = await stagesRes.json();
      setStages(stagesData.stages || []);
      
      // Load user progress
      if (user?.id) {
        const progressRes = await fetch(`${API_URL}/api/unified/progress/${user.id}`);
        const progressData = await progressRes.json();
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStageClick = (stage) => {
    if (!isStageUnlocked(stage)) {
      navigate('/pricing?from=Learning%20Stages');
      return;
    }
    navigate(`/unified/stage/${stage.stage_id}`);
  };
  
  const isStageUnlocked = (stage) => {
    const userPlan = user?.plan || 'free';
    // Free users: only Stage 1
    if (userPlan === 'free') {
      return stage.stage_id === 'stage_1';
    }
    // Explorer+ : all stages
    return true;
  };
  
  const getStageProgress = (stage) => {
    return userProgress?.stage_progress?.[stage.stage_id];
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'radial-gradient(at 0% 0%, hsla(152,100%,90%,1) 0, transparent 50%), radial-gradient(at 100% 0%, hsla(190,100%,92%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(37,100%,91%,1) 0, transparent 50%), #F8FAFC'
      }}
    >
      <GamificationHeader userProgress={userProgress} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6 rounded-full"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Learning Journey
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From absolute beginner to IELTS mastery. 
            Follow the path, complete lessons, and track your progress.
          </p>
        </div>
        
        {/* Daily Habit CTA - Glass Style */}
        <div 
          className="mb-8 p-6 rounded-3xl text-white"
          style={{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.95) 0%, rgba(239, 68, 68, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(249, 115, 22, 0.3)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Flame className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Daily Practice</h3>
                <p className="text-white/80">Keep your streak! 5-10 minutes of review.</p>
              </div>
            </div>
            <Button 
              className="bg-white text-orange-600 hover:bg-white/90 rounded-full shadow-lg"
              onClick={() => navigate('/unified/daily-habit')}
            >
              Start Daily Practice
            </Button>
          </div>
        </div>
        
        {/* Stage grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => (
            <StageCard
              key={stage.stage_id}
              stage={stage}
              isUnlocked={isStageUnlocked(stage)}
              progress={getStageProgress(stage)}
              onClick={handleStageClick}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-12 flex justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Complete previous stage to unlock</span>
          </div>
        </div>
      </div>
    </div>
  );
}
