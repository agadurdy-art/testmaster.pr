/**
 * Shared Game Components and Utilities
 * iOS 26 Glass Nature Theme - Emerald Green + White
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Star, Volume2, CheckCircle, X, Trophy, Sparkles } from 'lucide-react';

// ═══════ BROWSER TTS HELPER ═══════
export const speak = (text, options = {}) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.85;
    utterance.pitch = options.pitch || 1;
    window.speechSynthesis.speak(utterance);
  }
};

// ═══════ AUDIO BUTTON - Glass Style ═══════
export const AudioButton = ({ text, size = 'md', className = '', autoPlay = false }) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20'
  };

  useEffect(() => {
    if (autoPlay && text) {
      const timer = setTimeout(() => speak(text), 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, text]);

  return (
    <button
      onClick={() => speak(text)}
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-emerald ${className}`}
      data-testid="audio-button"
    >
      <Volume2 className={size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'} />
    </button>
  );
};

// ═══════ STAR RATING - Gold Stars ═══════
export const StarRating = ({ score, maxScore = 100 }) => {
  const percentage = (score / maxScore) * 100;
  const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;
  
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`w-10 h-10 transition-all duration-500 ${
            i <= stars 
              ? 'text-amber-400 fill-amber-400 drop-shadow-lg' 
              : 'text-slate-200'
          }`}
          style={{ 
            animationDelay: `${i * 0.15}s`,
            transform: i <= stars ? 'scale(1.1)' : 'scale(1)'
          }}
        />
      ))}
    </div>
  );
};

// ═══════ GAME WRAPPER - Glass Container ═══════
export const GameWrapper = ({ 
  title, 
  subtitle,
  icon: Icon,
  iconColor = 'emerald',
  currentQuestion,
  totalQuestions,
  children,
  onSkip,
  showProgress = true
}) => {
  const colorClasses = {
    emerald: 'bg-emerald-100/80 text-emerald-700',
    blue: 'bg-sky-100/80 text-sky-700',
    purple: 'bg-violet-100/80 text-violet-700',
    orange: 'bg-amber-100/80 text-amber-700',
    pink: 'bg-pink-100/80 text-pink-700',
    cyan: 'bg-cyan-100/80 text-cyan-700'
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="game-wrapper">
      <div className="flex items-center justify-between mb-5">
        <Badge className={`${colorClasses[iconColor]} border-0 px-4 py-1.5 rounded-full backdrop-blur-sm font-semibold`}>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {title}
        </Badge>
        <div className="flex items-center gap-4">
          {showProgress && (
            <span className="text-sm font-medium text-slate-500">
              {currentQuestion} / {totalQuestions}
            </span>
          )}
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-slate-400 hover:text-slate-600 rounded-full">
              Skip
            </Button>
          )}
        </div>
      </div>
      
      {showProgress && (
        <div className="mb-6 h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
          />
        </div>
      )}
      
      {subtitle && (
        <p className="text-center text-slate-500 text-sm font-medium mb-5">{subtitle}</p>
      )}
      
      {children}
    </div>
  );
};

// ═══════ OPTION BUTTON - Glass Style ═══════
export const OptionButton = ({ 
  children, 
  onClick, 
  disabled, 
  isSelected, 
  isCorrect, 
  showFeedback,
  size = 'md',
  className = ''
}) => {
  let stateClasses = 'bg-white/70 border-white/50 hover:bg-white hover:border-emerald-200 hover:shadow-lg';
  
  if (showFeedback) {
    if (isCorrect) {
      stateClasses = 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-emerald';
    } else if (isSelected && !isCorrect) {
      stateClasses = 'bg-red-50 border-red-300 text-red-700';
    } else {
      stateClasses = 'bg-white/40 border-white/30 opacity-50';
    }
  } else if (isSelected) {
    stateClasses = 'bg-emerald-50 border-emerald-400 shadow-lg';
  }

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-5 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || showFeedback}
      className={`w-full rounded-2xl text-left border-2 backdrop-blur-sm transition-all duration-300 font-semibold ${sizeClasses[size]} ${stateClasses} ${className}`}
      data-testid="option-button"
    >
      <div className="flex items-center justify-between">
        <span className="text-slate-700">{children}</span>
        {showFeedback && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-500" />}
        {showFeedback && isSelected && !isCorrect && <X className="w-6 h-6 text-red-500" />}
      </div>
    </button>
  );
};

// ═══════ EMOJI CARD - Glass Style ═══════
export const EmojiCard = ({
  emoji,
  label,
  onClick,
  disabled,
  isSelected,
  isCorrect,
  showFeedback,
  size = 'md'
}) => {
  let stateClasses = 'bg-white/70 border-white/50 hover:bg-white hover:shadow-xl hover:scale-105 hover:-translate-y-1';
  
  if (showFeedback) {
    if (isCorrect) {
      stateClasses = 'bg-emerald-50 border-emerald-400 scale-105 shadow-emerald';
    } else if (isSelected && !isCorrect) {
      stateClasses = 'bg-red-50 border-red-300 animate-shake';
    } else {
      stateClasses = 'bg-white/30 border-white/20 opacity-40';
    }
  } else if (isSelected) {
    stateClasses = 'bg-emerald-50 border-emerald-400 scale-105 shadow-lg';
  }

  const sizeClasses = {
    sm: 'w-20 h-20 text-3xl',
    md: 'w-28 h-28 text-5xl',
    lg: 'w-32 h-32 text-6xl'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || showFeedback}
      className={`${sizeClasses[size]} rounded-3xl border-2 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 ${stateClasses}`}
      data-testid={`emoji-card-${label || emoji}`}
    >
      <span className="mb-1 drop-shadow-sm">{emoji}</span>
      {label && <span className="text-xs text-slate-600 font-semibold">{label}</span>}
    </button>
  );
};

// ═══════ GAME COMPLETE SCREEN - Glass Style ═══════
export const GameComplete = ({ 
  score, 
  totalQuestions, 
  onContinue, 
  onRetry,
  title = "Well Done!"
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;

  return (
    <div className="glass-card p-10 text-center max-w-md mx-auto">
      <div className="mb-6">
        {stars >= 2 ? (
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center animate-float shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        ) : (
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-emerald">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        )}
      </div>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-3">{title}</h2>
      <p className="text-slate-500 mb-6 text-lg">
        You got <span className="font-bold text-emerald-600">{score}</span> out of <span className="font-bold">{totalQuestions}</span> correct!
      </p>
      
      <div className="flex justify-center mb-8">
        <StarRating score={percentage} />
      </div>
      
      <div className="flex gap-4 justify-center">
        {percentage < 70 && onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="rounded-full px-6 py-3 border-2 border-slate-200 hover:border-emerald-300"
          >
            Try Again
          </Button>
        )}
        <Button 
          onClick={onContinue}
          className="rounded-full px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald text-white font-bold"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

// ═══════ FEEDBACK ANIMATION ═══════
export const FeedbackOverlay = ({ isCorrect, show }) => {
  if (!show) return null;
  
  return (
    <div className={`fixed inset-0 pointer-events-none flex items-center justify-center z-50 ${
      isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'
    }`}>
      <div className={`text-7xl ${isCorrect ? 'animate-bounce' : 'animate-shake'}`}>
        {isCorrect ? '✓' : '✗'}
      </div>
    </div>
  );
};

// ═══════ SHUFFLE UTILITY ═══════
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ═══════ LETTER INPUT - Glass Style ═══════
export const LetterInput = ({ 
  value, 
  onChange, 
  maxLength, 
  disabled,
  placeholder = "Type here...",
  autoFocus = true
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.toLowerCase())}
      maxLength={maxLength}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full px-5 py-4 text-xl text-center bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50 disabled:opacity-60 transition-all font-semibold text-slate-700 placeholder:text-slate-400"
      data-testid="letter-input"
    />
  );
};

// ═══════ DRAGGABLE LETTER TILE - Glass Style ═══════
export const LetterTile = ({ letter, onClick, isUsed, isCorrect, showFeedback }) => {
  let stateClasses = 'bg-white/80 border-white/50 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-lg';
  
  if (isUsed) {
    stateClasses = 'bg-slate-100/50 border-slate-200 opacity-40 cursor-not-allowed';
  }
  
  if (showFeedback && isCorrect) {
    stateClasses = 'bg-emerald-100 border-emerald-500 text-emerald-700';
  }

  return (
    <button
      onClick={onClick}
      disabled={isUsed}
      className={`w-14 h-14 rounded-2xl border-2 backdrop-blur-sm font-bold text-xl uppercase transition-all duration-200 ${stateClasses}`}
      data-testid={`letter-tile-${letter}`}
    >
      {letter}
    </button>
  );
};

export default {
  speak,
  AudioButton,
  StarRating,
  GameWrapper,
  OptionButton,
  EmojiCard,
  GameComplete,
  FeedbackOverlay,
  shuffleArray,
  LetterInput,
  LetterTile
};
