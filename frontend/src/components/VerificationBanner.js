import React, { useState, useEffect } from 'react';
import { AlertTriangle, Mail, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { resendVerificationEmail } from '../lib/api';
import { toast } from 'sonner';

export default function VerificationBanner({ user, onDismiss }) {
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Don't show if verified or dismissed
  if (!user || user.verified || user.email_verified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (resending || cooldown > 0) return;
    
    setResending(true);
    try {
      const result = await resendVerificationEmail(user.email);
      
      if (result.already_verified) {
        toast.success('Your email is already verified! Refreshing...');
        // Refresh user data
        window.location.reload();
        return;
      }
      
      if (result.sent) {
        toast.success('✅ Verification email sent! Check your inbox and spam folder.');
        setCooldown(60); // 60 second cooldown
      } else {
        toast.error('Failed to send email. Please try again later.');
      }
    } catch (error) {
      const message = error?.response?.data?.detail || 'Failed to send verification email';
      if (message.includes('wait')) {
        // Extract wait time from error message
        const match = message.match(/(\d+)/);
        if (match) {
          setCooldown(parseInt(match[1]));
        }
        toast.error(message);
      } else {
        toast.error(message);
      }
    } finally {
      setResending(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                ⚠️ Verify your email to unlock all courses!
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Check your inbox (and spam folder) for the verification link
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs"
            >
              {resending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <Mail className="w-3 h-3 mr-1" />
                  Resend ({cooldown}s)
                </>
              ) : (
                <>
                  <Mail className="w-3 h-3 mr-1" />
                  Resend Email
                </>
              )}
            </Button>
            
            <button
              onClick={handleDismiss}
              className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Locked Content Modal Component
export function LockedContentModal({ isOpen, onClose, user, featureName = "this feature" }) {
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!isOpen) return null;

  const handleResend = async () => {
    if (resending || cooldown > 0 || !user?.email) return;
    
    setResending(true);
    try {
      const result = await resendVerificationEmail(user.email);
      
      if (result.already_verified) {
        toast.success('Your email is already verified! Refreshing...');
        window.location.reload();
        return;
      }
      
      if (result.sent) {
        toast.success('✅ Email sent! Check your inbox and spam folder.');
        setCooldown(60);
      }
    } catch (error) {
      const message = error?.response?.data?.detail || 'Failed to send email';
      if (message.includes('wait')) {
        const match = message.match(/(\d+)/);
        if (match) setCooldown(parseInt(match[1]));
      }
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Email Verification Required</h2>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            To access <strong>{featureName}</strong>, please verify your email address first.
          </p>
          
          <div className="bg-amber-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 text-center">
              📧 Check your inbox (and spam folder) for the verification link we sent to:
            </p>
            <p className="text-sm font-semibold text-amber-900 text-center mt-1">
              {user?.email}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            >
              {resending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Email ({cooldown}s)
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Need help? <a href="mailto:testmaster.edu.ai@proton.me" className="text-violet-600 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to check if user can access a feature
export function canAccessFeature(user, featureType) {
  // If no user, only allow public features
  if (!user) {
    return featureType === 'public' || featureType === 'level-test';
  }
  
  // Verified users have full access
  if (user.verified || user.email_verified) {
    return true;
  }
  
  // Unverified users - limited access
  const unverifiedAllowed = [
    'browse-courses',     // Can browse course descriptions
    'first-lesson',       // Can watch first lesson of each course
    'level-test',         // Can take free level test
    'ai-mentor-limited',  // 3 messages max
    'profile-settings',   // Can view profile
  ];
  
  return unverifiedAllowed.includes(featureType);
}

// Lock icon component for locked content
export function LockIcon({ size = 'sm', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  return (
    <div className={`inline-flex items-center justify-center bg-gray-100 rounded-full p-1 ${className}`}>
      <svg 
        className={`${sizeClasses[size]} text-gray-500`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
        />
      </svg>
    </div>
  );
}
