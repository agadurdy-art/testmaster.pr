import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { verifyEmail, resendVerificationEmail } from '../lib/api';
import { CheckCircle, XCircle, Loader2, Mail, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, already_verified
  const [message, setMessage] = useState('Verifying your email...');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Please use the link from your email.');
      return;
    }

    const run = async () => {
      try {
        const result = await verifyEmail(token);
        
        if (result.already_verified) {
          setStatus('already_verified');
          setMessage('Your email is already verified!');
        } else {
          setStatus('success');
          setMessage('Your email has been verified! You now have full access to all features.');
        }
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Verification failed. The link may have expired.';
        setStatus('error');
        setMessage(detail);
      }
    };

    run();
  }, [searchParams]);

  const handleResend = async () => {
    const email = searchParams.get('email');
    if (!email || resending || cooldown > 0) {
      toast.error('Please log in and use the resend button on the dashboard.');
      return;
    }
    
    setResending(true);
    try {
      const result = await resendVerificationEmail(email);
      if (result.sent) {
        toast.success('New verification email sent! Check your inbox.');
        setCooldown(60);
      }
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center border-0 shadow-xl rounded-2xl">
        {/* Icon based on status */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-20 h-20 mx-auto bg-violet-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>
          )}
          {status === 'already_verified' && (
            <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-blue-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-3 text-gray-900">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && '🎉 Email Verified!'}
          {status === 'already_verified' && 'Already Verified'}
          {status === 'error' && 'Verification Failed'}
        </h1>
        
        <p className={`mb-6 text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>

        {status === 'success' && (
          <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-2">✅ You now have access to:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All course lessons</li>
              <li>• Full practice tests</li>
              <li>• Progress tracking & certificates</li>
              <li>• Unlimited AI mentor</li>
              <li>• Pronunciation evaluation</li>
            </ul>
          </div>
        )}

        {status === 'error' && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              The verification link may have expired. You can request a new one from the dashboard.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white"
          >
            {status === 'success' ? 'Go to Dashboard' : 'Back to Dashboard'}
          </Button>
          
          {status === 'error' && (
            <Button 
              variant="outline"
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Home
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
