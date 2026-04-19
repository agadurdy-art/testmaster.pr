import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-10 self-start">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 text-violet-600 mb-4">
          <BookOpen className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Teacher Blog</h1>
        <p className="text-gray-600 mb-8">
          We're putting together honest, student-tested IELTS writing and speaking articles. First posts launch shortly.
        </p>
        <p className="text-sm text-gray-500">
          Want to be emailed when the first post is up?{' '}
          <a href="mailto:support@testmaster.pro?subject=Notify%20me%20when%20blog%20launches" className="text-violet-600 hover:underline">
            Drop us a line
          </a>.
        </p>
      </div>
    </div>
  );
}
