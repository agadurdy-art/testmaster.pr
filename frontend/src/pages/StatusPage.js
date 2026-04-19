import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const COMPONENTS = [
  { name: 'Website & Dashboard', status: 'operational' },
  { name: 'Evaluator (Writing band scoring)', status: 'operational' },
  { name: 'Liz AI Tutor', status: 'operational' },
  { name: 'Practice & Tests', status: 'operational' },
  { name: 'Payments (PayPal, SePay)', status: 'operational' },
];

// Static status page. Not wired to a real health-check endpoint yet — the
// homepage for that is "no incident, everything green." When an incident
// happens, update this file manually (or wire to /api/health).
export default function StatusPage() {
  const lastChecked = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <h1 className="text-3xl font-bold">All systems operational</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">Last checked: {lastChecked}</p>

        <div className="divide-y divide-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          {COMPONENTS.map((c) => (
            <div key={c.name} className="flex items-center justify-between px-5 py-4">
              <div className="text-sm font-medium text-gray-900">{c.name}</div>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                Operational
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mt-8">
          If you're seeing an issue that isn't reflected here, email{' '}
          <a href="mailto:support@testmaster.pro" className="text-violet-600 hover:underline">support@testmaster.pro</a>.
        </p>
      </div>
    </div>
  );
}
