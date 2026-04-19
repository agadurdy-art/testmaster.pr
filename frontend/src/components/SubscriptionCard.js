import React, { useState } from 'react';
import { Card } from './ui/card';
import { cancelPaypalSubscription } from '../lib/api';

/**
 * Subscription management card for the Dashboard.
 *
 * Renders nothing for free users. For paid users it shows their current plan
 * plus a Cancel button that calls POST /payments/paypal/cancel-subscription.
 *
 * Cancelling does NOT immediately revoke paid access — PayPal keeps the sub
 * active until the end of the current billing period and fires a webhook
 * (BILLING.SUBSCRIPTION.CANCELLED) which downgrades the user to free. What
 * cancel does immediately is set `subscription_cancelled_at` so we can show
 * a "Cancellation scheduled" banner here.
 */
const PLAN_LABELS = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  exam: 'Exam Pack',
  explorer: 'Explorer',
  learner: 'Learner',
  achiever: 'Achiever',
  master: 'Master',
};

export default function SubscriptionCard({
  user,
  getText,
  textPrimary,
  textSecondary,
  bgCard,
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [cancelledAt, setCancelledAt] = useState(user?.subscription_cancelled_at || null);

  const plan = user?.plan || 'free';
  if (plan === 'free') return null;

  const t = (en, vi, tr) => (getText ? getText(en, vi, tr) : en);
  const label = PLAN_LABELS[plan] || plan;
  const subId = user?.paypal_subscription_id;

  const handleCancel = async () => {
    if (!user?.email) return;
    const confirmMsg = t(
      'Cancel your subscription? You keep paid access until the end of the current period.',
      'Hủy đăng ký? Bạn vẫn có quyền truy cập đến hết kỳ hiện tại.',
      'Aboneliği iptal et? Mevcut dönemin sonuna kadar erişiminiz devam edecek.',
    );
    if (!window.confirm(confirmMsg)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await cancelPaypalSubscription({ email: user.email });
      const now = new Date().toISOString();
      setCancelledAt(now);
      // Update the cached user so a reload reflects the cancelled state.
      try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        if (stored) {
          localStorage.setItem(
            'user',
            JSON.stringify({ ...stored, subscription_cancelled_at: now }),
          );
        }
      } catch (_) { /* non-fatal */ }
      window.alert(res?.detail || t('Subscription cancelled.', 'Đã hủy đăng ký.', 'Abonelik iptal edildi.'));
    } catch (e) {
      setError(e?.response?.data?.detail || t('Cancel failed. Please try again.', 'Hủy thất bại.', 'İptal başarısız.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className={`p-4 mb-4 rounded-2xl ${bgCard || ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-xs uppercase tracking-wide ${textSecondary || 'text-gray-500'}`}>
            {t('Current plan', 'Gói hiện tại', 'Mevcut plan')}
          </p>
          <p className={`text-lg font-semibold ${textPrimary || 'text-gray-900'}`}>{label}</p>
          {cancelledAt ? (
            <p className={`text-xs mt-1 ${textSecondary || 'text-gray-500'}`}>
              {t(
                'Cancellation scheduled — access continues until period end.',
                'Đã hẹn hủy — vẫn dùng được đến hết kỳ.',
                'İptal planlandı — dönem sonuna kadar erişim devam eder.',
              )}
            </p>
          ) : null}
        </div>
        {!cancelledAt && subId ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {busy
              ? t('Cancelling…', 'Đang hủy…', 'İptal ediliyor…')
              : t('Cancel', 'Hủy', 'İptal et')}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      ) : null}
    </Card>
  );
}
