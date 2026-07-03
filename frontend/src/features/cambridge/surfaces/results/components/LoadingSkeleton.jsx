import React from 'react';

// Full-page skeleton shown while /evaluate/full-test is in flight.
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor).

export default function LoadingSkeleton() {
  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 py-8 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-3xl animate-pulse" />
            <div className="h-10 w-64 mx-auto bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-5 w-48 mx-auto bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
            <div className="h-20 w-32 mx-auto bg-gray-200 rounded-lg animate-pulse mb-6" />
            <div className="grid grid-cols-4 gap-4 pt-6 border-t">
              {[1,2,3,4].map(i => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-6 w-10 mx-auto bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-4 w-16 mx-auto bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg mb-4">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
  );
}
