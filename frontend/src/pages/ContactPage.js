import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <h1 className="text-3xl font-bold mb-2">Contact</h1>
        <p className="text-gray-600 mb-8">
          A real teacher reads every email. Response in 24–48 hours (Ho Chi Minh City time).
        </p>

        <div className="space-y-4">
          <a
            href="mailto:support@testmaster.pro"
            className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 hover:border-violet-400 hover:shadow-sm transition"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Email support</div>
              <div className="text-sm text-gray-600">support@testmaster.pro</div>
              <div className="text-xs text-gray-500 mt-1">For account, billing, refunds, and general questions.</div>
            </div>
          </a>

          <div className="flex items-start gap-4 p-5 rounded-xl border border-gray-200">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">In-app feedback</div>
              <div className="text-sm text-gray-600">Logged-in users can send feedback from the dashboard.</div>
              <div className="text-xs text-gray-500 mt-1">Fastest route — we see it next to your account context.</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-10">
          Press, partnerships, or teacher-collaboration inquiries: use the email above with subject line "Partnership".
        </p>
      </div>
    </div>
  );
}
