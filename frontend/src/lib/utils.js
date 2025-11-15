import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function getBandScoreColor(score) {
  if (score >= 8.0) return 'text-green-600';
  if (score >= 7.0) return 'text-blue-600';
  if (score >= 6.0) return 'text-yellow-600';
  if (score >= 5.0) return 'text-orange-600';
  return 'text-red-600';
}

export function getBandScoreBg(score) {
  if (score >= 8.0) return 'bg-green-100';
  if (score >= 7.0) return 'bg-blue-100';
  if (score >= 6.0) return 'bg-yellow-100';
  if (score >= 5.0) return 'bg-orange-100';
  return 'bg-red-100';
}