import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Heart } from 'lucide-react';
import TestimonialSubmitForm from '../components/TestimonialSubmitForm';

// Standalone submission page — linked from dashboard banner + landing footer.
// Intentionally minimal so it loads fast and the form is the focus.
export default function ShareYourStoryPage({ user }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-100 mb-3">
            <Heart className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share your IELTS Ace story</h1>
          <p className="text-gray-600">
            Your story helps other learners decide whether this is right for them. Approved
            stories appear on our landing page — we won't share your email.
          </p>
        </div>
        <TestimonialSubmitForm user={user} />
      </div>
    </div>
  );
}
