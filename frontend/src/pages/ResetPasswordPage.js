import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../lib/api';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (!t) {
      toast.error('Missing reset token. Please use the link from your email.');
      navigate('/');
      return;
    }
    setToken(t);
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast.error('Please enter and confirm your new password.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword(token, password);
      toast.success('Password updated. You can now log in.');
      navigate('/');
    } catch (err) {
      const detail = err?.response?.data?.detail || 'Failed to reset password. The link may have expired.';
      toast.error(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lg-auth">
      <div className="lg-aurora" aria-hidden="true"><i></i><i></i><i></i></div>
      <div className="lg-shell">
        <div className="lg-card">
          <div className="lg-brand">
            <img src="/brand/ielts-ace-logo.jpg" alt="IELTS Ace" style={{ width: 42, height: 42, borderRadius: 13, objectFit: 'cover', boxShadow: '0 6px 16px -4px rgba(16,185,129,.35)' }} />
            <div><b>IELTS Ace</b><small>by testmaster.pro</small></div>
          </div>

          <h1 className="lg-title">Set a new password</h1>
          <p className="lg-sub">Choose a strong password — at least 8 characters.</p>

          <form onSubmit={handleSubmit}>
            <div className="lg-field">
              <input
                id="rp-pwd"
                type={show ? 'text' : 'password'}
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
              <label htmlFor="rp-pwd">New password</label>
              <button type="button" className="lg-eye" onClick={() => setShow((v) => !v)} tabIndex={-1} aria-label="Toggle password visibility">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="lg-field">
              <input
                id="rp-confirm"
                type={show ? 'text' : 'password'}
                placeholder=" "
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
              <label htmlFor="rp-confirm">Confirm new password</label>
            </div>

            <button type="submit" className="lg-cta" disabled={submitting}>
              {submitting ? 'Updating…' : 'Set new password'}
            </button>
          </form>

          <div className="lg-foot">
            <button type="button" onClick={() => navigate('/login')}>Back to sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
