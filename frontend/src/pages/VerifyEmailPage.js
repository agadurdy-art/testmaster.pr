import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../lib/api';
import { CheckCircle, XCircle, Loader2, PartyPopper } from 'lucide-react';
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
    <div className="lg-auth">
      <div className="lg-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="lg-shell">
        <div className="lg-card lg-center">
          <div className="lg-status is-load" style={{ display: status === 'loading' ? 'grid' : 'none' }}>
            <Loader2 className="w-9 h-9 animate-spin" />
          </div>
          {status === 'success' && (
            <div className="lg-status is-ok"><PartyPopper className="w-9 h-9" /></div>
          )}
          {status === 'already_verified' && (
            <div className="lg-status is-info"><CheckCircle className="w-9 h-9" /></div>
          )}
          {status === 'error' && (
            <div className="lg-status is-err"><XCircle className="w-9 h-9" /></div>
          )}

          <h1 className="lg-title">
            {status === 'loading' && 'Verifying email…'}
            {status === 'success' && '🎉 Email verified!'}
            {status === 'already_verified' && 'Already verified'}
            {status === 'error' && 'Verification failed'}
          </h1>

          <p className={`lg-msg${status === 'error' ? ' err' : ''}`}>{message}</p>

          {status === 'success' && (
            <div className="lg-info">
              <h3>You now have access to:</h3>
              <ul>
                <li>All course lessons</li>
                <li>Full practice tests</li>
                <li>Progress tracking &amp; certificates</li>
                <li>Unlimited AI mentor</li>
                <li>Pronunciation evaluation</li>
              </ul>
            </div>
          )}

          {status === 'error' && (
            <p className="lg-msg">The verification link may have expired. You can request a new one from the dashboard.</p>
          )}

          <button type="button" className="lg-cta" onClick={() => navigate('/dashboard')}>
            {status === 'success' ? 'Go to Dashboard' : 'Back to Dashboard'}
          </button>
          {status === 'error' && (
            <button type="button" className="lg-ghost" onClick={() => navigate('/')}>Go to Home</button>
          )}
        </div>
      </div>
    </div>
  );
}
