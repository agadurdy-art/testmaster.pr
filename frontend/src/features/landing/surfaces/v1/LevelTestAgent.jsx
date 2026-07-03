// LevelTestAgent — verbatim from pages/LandingPage.js lines 24-173 (Faz1 wave 10).
// Self-contained top-level component (shows once per device for non-logged visitors).
import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Trophy, Sparkles, Clock } from 'lucide-react';
import { useI18n } from '../../../../lib/i18n';

// Level Test Agent Component - Shows once per device for non-logged visitors
function LevelTestAgent({ user, onShowSignup }) {
  const [callStarted, setCallStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(240); // 4 minutes = 240 seconds
  const [callEnded, setCallEnded] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const { language } = useI18n();

  // Check if should show on mount
  useEffect(() => {
    // Only show for non-logged in visitors who haven't seen it before
    const hasSeenAgent = localStorage.getItem('ielts_level_test_agent_shown');
    if (!user && !hasSeenAgent) {
      setShouldShow(true);
      // Mark as shown on this device
      localStorage.setItem('ielts_level_test_agent_shown', 'true');
    }
  }, [user]);

  // Show/hide widget based on shouldShow state
  useEffect(() => {
    const widget = document.getElementById('ielts-level-test-agent');
    if (!widget) return;
    
    if (shouldShow) {
      widget.style.display = 'block';
    } else {
      widget.style.display = 'none';
    }

    return () => {
      if (widget) {
        widget.style.display = 'none';
      }
    };
  }, [shouldShow]);

  // 4-minute countdown timer when call starts
  useEffect(() => {
    if (!callStarted || callEnded) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCallEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callStarted, callEnded]);

  // Listen for call start (when user clicks the phone button)
  useEffect(() => {
    if (!shouldShow) return;

    const checkCallStatus = () => {
      const widget = document.querySelector('#ielts-level-test-agent elevenlabs-convai');
      if (widget && widget.shadowRoot) {
        // Check if call is active by looking for active call indicators
        const activeCall = widget.shadowRoot.querySelector('[data-state="open"], .call-active, [aria-label*="End"]');
        if (activeCall && !callStarted) {
          setCallStarted(true);
        }
      }
    };

    const interval = setInterval(checkCallStatus, 1000);
    return () => clearInterval(interval);
  }, [shouldShow, callStarted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getText = (en, vi, tr) => {
    if (language === 'vi') return vi;
    if (language === 'tr') return tr;
    return en;
  };

  if (!shouldShow) return null;

  return (
    <>
      {/* Timer overlay when call is active */}
      {callStarted && !callEnded && (
        <div className="fixed bottom-24 right-4 z-[10000] bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{formatTime(timeRemaining)}</span>
            <span className="text-xs opacity-80">
              {getText('remaining', 'còn lại', 'kalan')}
            </span>
          </div>
        </div>
      )}

      {/* Sign-up prompt after call ends */}
      {callEnded && (
        <div className="fixed inset-0 bg-black/50 z-[10001] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 bg-white rounded-2xl shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {getText(
                  'Great conversation!',
                  'Cuộc trò chuyện tuyệt vời!',
                  'Harika konuşma!'
                )}
              </h3>
              <p className="text-gray-600 mb-6">
                {getText(
                  'Ready to take your IELTS preparation to the next level? Sign up now for full access to AI-powered practice tests, personalized feedback, and comprehensive courses.',
                  'Sẵn sàng nâng cao kỹ năng IELTS của bạn? Đăng ký ngay để truy cập đầy đủ các bài kiểm tra AI, phản hồi cá nhân hóa và các khóa học toàn diện.',
                  'IELTS hazırlığınızı bir sonraki seviyeye taşımaya hazır mısınız? AI destekli pratik testlere, kişiselleştirilmiş geri bildirimlere ve kapsamlı kurslara tam erişim için şimdi kaydolun.'
                )}
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 text-lg"
                  onClick={() => {
                    setCallEnded(false);
                    onShowSignup();
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {getText('Sign Up Free', 'Đăng ký miễn phí', 'Ücretsiz Kaydol')}
                </Button>
                <button 
                  className="text-gray-500 text-sm hover:text-gray-700"
                  onClick={() => setCallEnded(false)}
                >
                  {getText('Maybe later', 'Để sau', 'Belki sonra')}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default LevelTestAgent;
