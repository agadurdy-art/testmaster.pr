/**
 * Shared Game Components and Utilities
 * Provides common functionality for all vocabulary and grammar games
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
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'en-US';
    utterance.rate = options.rate || 0.85;
    utterance.pitch = options.pitch || 1;
    window.speechSynthesis.speak(utterance);
  }
};

// ═══════ AUDIO BUTTON ═══════
export const AudioButton = ({ text, size = 'md', className = '', autoPlay = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
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
      className={`${sizeClasses[size]} rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg ${className}`}
      data-testid="audio-button"
    >
      <Volume2 className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'} />
    </button>
  );
};

// ═══════ STAR RATING ═══════
export const StarRating = ({ score, maxScore = 100 }) => {
  const percentage = (score / maxScore) * 100;
  const stars = percentage >= 90 ? 3 : percentage >= 70 ? 2 : percentage >= 50 ? 1 : 0;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={`w-8 h-8 transition-all ${
            i <= stars 
              ? 'text-yellow-400 fill-yellow-400 animate-pulse' 
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

// ═══════ GAME WRAPPER ═══════
export const GameWrapper = ({ 
  title, 
  subtitle,
  icon: Icon,
  iconColor = 'blue',
  currentQuestion,
  totalQuestions,
  children,
  onSkip,
  showProgress = true
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-700',
    pink: 'bg-pink-100 text-pink-700',
    cyan: 'bg-cyan-100 text-cyan-700'
  };

  return (
    <div className="w-full max-w-2xl mx-auto" data-testid="game-wrapper">
      <div className="flex items-center justify-between mb-4">
        <Badge className={`${colorClasses[iconColor]} border-0 px-3 py-1`}>
          {Icon && <Icon className="w-4 h-4 mr-1.5" />}
          {title}
        </Badge>
        <div className="flex items-center gap-3">
          {showProgress && (
            <span className="text-sm text-gray-500">
              {currentQuestion} / {totalQuestions}
            </span>
          )}
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          )}
        </div>
      </div>
      
      {showProgress && (
        <Progress 
          value={(currentQuestion / totalQuestions) * 100} 
          className="mb-6 h-2"
        />
      )}
      
      {subtitle && (
        <p className="text-center text-gray-500 text-sm mb-4">{subtitle}</p>
      )}
      
      {children}
    </div>
  );
};

// ═══════ OPTION BUTTON ═══════
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
  let stateClasses = 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
  
  if (showFeedback) {
    if (isCorrect) {
      stateClasses = 'border-green-500 bg-green-50 text-green-800';
    } else if (isSelected && !isCorrect) {
      stateClasses = 'border-red-500 bg-red-50 text-red-800';
    } else {
      stateClasses = 'border-gray-200 opacity-50';
    }
  } else if (isSelected) {
    stateClasses = 'border-blue-500 bg-blue-50';
  }

  const sizeClasses = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-base',
    lg: 'p-6 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || showFeedback}
      className={`w-full rounded-xl text-left border-2 transition-all font-medium ${sizeClasses[size]} ${stateClasses} ${className}`}
      data-testid="option-button"
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        {showFeedback && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
        {showFeedback && isSelected && !isCorrect && <X className="w-5 h-5 text-red-600" />}
      </div>
    </button>
  );
};

// ═══════ EMOJI CARD ═══════
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
  let stateClasses = 'border-gray-200 hover:border-blue-300 hover:shadow-lg hover:scale-105';
  
  if (showFeedback) {
    if (isCorrect) {
      stateClasses = 'border-green-500 bg-green-50 scale-105 shadow-lg';
    } else if (isSelected && !isCorrect) {
      stateClasses = 'border-red-500 bg-red-50 animate-shake';
    } else {
      stateClasses = 'border-gray-200 opacity-40';
    }
  } else if (isSelected) {
    stateClasses = 'border-blue-500 bg-blue-50 scale-105 shadow-lg';
  }

  const sizeClasses = {
    sm: 'w-20 h-20 text-3xl',
    md: 'w-28 h-28 text-5xl',
    lg: 'w-36 h-36 text-6xl'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || showFeedback}
      className={`${sizeClasses[size]} rounded-2xl border-2 flex flex-col items-center justify-center transition-all bg-white ${stateClasses}`}
      data-testid={`emoji-card-${label || emoji}`}
    >
      <span className="mb-1">{emoji}</span>
      {label && <span className="text-xs text-gray-600 font-medium">{label}</span>}
    </button>
  );
};

// ═══════ GAME COMPLETE SCREEN ═══════
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
    <Card className="p-8 text-center max-w-md mx-auto">
      <div className="mb-4">
        {stars >= 2 ? (
          <Sparkles className="w-16 h-16 mx-auto text-yellow-500 animate-bounce" />
        ) : (
          <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
        )}
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">
        You got {score} out of {totalQuestions} correct!
      </p>
      
      <div className="flex justify-center mb-6">
        <StarRating score={percentage} />
      </div>
      
      <div className="flex gap-3 justify-center">
        {percentage < 70 && onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
        <Button onClick={onContinue}>
          Continue
        </Button>
      </div>
    </Card>
  );
};

// ═══════ FEEDBACK ANIMATION ═══════
export const FeedbackOverlay = ({ isCorrect, show }) => {
  if (!show) return null;
  
  return (
    <div className={`fixed inset-0 pointer-events-none flex items-center justify-center z-50 ${
      isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
    } animate-pulse`}>
      <div className={`text-6xl ${isCorrect ? 'animate-bounce' : 'animate-shake'}`}>
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

// ═══════ LETTER INPUT (for writing games) ═══════
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
      className="w-full px-4 py-3 text-xl text-center border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
      data-testid="letter-input"
    />
  );
};

// ═══════ DRAGGABLE LETTER TILE ═══════
export const LetterTile = ({ letter, onClick, isUsed, isCorrect, showFeedback }) => {
  let stateClasses = 'bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400';
  
  if (isUsed) {
    stateClasses = 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed';
  }
  
  if (showFeedback && isCorrect) {
    stateClasses = 'bg-green-100 border-green-500 text-green-700';
  }

  return (
    <button
      onClick={onClick}
      disabled={isUsed}
      className={`w-12 h-12 rounded-lg border-2 font-bold text-xl uppercase transition-all ${stateClasses}`}
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
