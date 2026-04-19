import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 text-violet-600 mb-5">
          <Compass className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-600 mb-1">
          We couldn't find <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">{pathname}</code>.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          The link may have moved, or you may have typed the URL directly.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
