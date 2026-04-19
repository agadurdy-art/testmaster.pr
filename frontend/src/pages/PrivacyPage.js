import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Minimal but truthful privacy notice. Paired with Terms so payment processors
// (PayPal, SePay) can link compliance reviewers here. Update the email +
// company name if either changes.
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: April 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. What we collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li><strong>Account data</strong> — your name, email address, and hashed password (or Google account ID if you use Google Sign-In).</li>
              <li><strong>Learning data</strong> — essays you submit, practice answers, test results, vocabulary progress, and chat messages with our AI tutor (Liz).</li>
              <li><strong>Payment data</strong> — processed by PayPal or SePay. We store the transaction ID and plan purchased, never your full card details.</li>
              <li><strong>Technical data</strong> — basic request logs (IP, user agent, timestamps) for security and debugging.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How we use it</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              <li>To run the service: authenticate you, score your essays, track your progress, deliver lessons.</li>
              <li>To improve the product: aggregate, non-identifying metrics (e.g., average band scores by country). We do <strong>not</strong> train public AI models on your essays.</li>
              <li>To contact you: transactional emails (email verification, password reset, receipts). You can opt out of product updates at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Who we share it with</h2>
            <p className="text-gray-700">We share data only with service providers needed to run testmaster.pro:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 mt-2">
              <li>Anthropic (AI evaluation and tutoring — your essay and chat text are sent to their API for processing).</li>
              <li>Azure (text-to-speech for Liz's voice).</li>
              <li>PayPal and SePay (payment processing).</li>
              <li>Google (if you use Google Sign-In).</li>
            </ul>
            <p className="text-gray-700 mt-2">We never sell your data and we don't use it for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. How long we keep it</h2>
            <p className="text-gray-700">
              We keep your account and learning data while your account is active. If you delete your account, we remove
              personal data within 30 days. Anonymized aggregates and legally-required records (e.g., tax receipts) may be
              retained longer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Your rights</h2>
            <p className="text-gray-700">
              You can access, export, correct, or delete your data at any time from your profile page, or by emailing us.
              If you are in the EU/UK, you have rights under GDPR; if you are in California, under CCPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
            <p className="text-gray-700">
              Questions about this policy? Email <a href="mailto:support@testmaster.pro" className="text-violet-600 hover:underline">support@testmaster.pro</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
