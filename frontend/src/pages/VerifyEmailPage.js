import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { verifyEmail } from '../lib/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Please use the link from your email.');
      return;
    }

    const run = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified. You can now log in.');
      } catch (err) {
        const detail = err?.response?.data?.detail || 'Verification failed. The link may have expired.';
        setStatus('error');
        setMessage(detail);
      }
    };

    run();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p className={`mb-6 text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-700'}`}>{message}</p>
        <Button onClick={() => navigate('/')}>Go to Login</Button>
      </Card>
    </div>
  );
}
