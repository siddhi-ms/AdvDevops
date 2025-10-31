import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GetPremium() {
  const navigate = useNavigate();
  return (
    <div className="pt-20 min-h-screen bg-gray-50 flex items-start justify-center">
      <div className="w-full max-w-6xl mx-6 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left - Free */}
          <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col items-center justify-center bg-white">
            <div className="text-center">
              <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Free</h2>
              <p className="text-gray-600 mb-6">Access core features, join community sessions, and learn at your own pace.</p>
              <ul className="text-left text-gray-700 space-y-2 mb-6">
                <li>• Browse skills and community</li>
                <li>• Book standard sessions</li>
                <li>• Basic messaging</li>
              </ul>
              <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:shadow-sm transition cursor-pointer">Continue with Free</button>
            </div>
          </div>

          {/* Right - Premium */}
          <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-yellow-100 border-l md:border-l-0">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.29a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.29c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.839-.197-1.54-1.118l1.07-3.29a1 1 0 00-.364-1.118L2.98 8.717c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.29z" />
                </svg>
                <h2 className="text-4xl font-extrabold text-amber-700">Premium</h2>
              </div>

              <p className="text-amber-700 mb-6">Get priority sessions, exclusive workshops, and advanced features tailored for fast learners.</p>

              <ul className="text-left text-amber-800 space-y-2 mb-6">
                <li>• Priority booking & top instructors</li>
                <li>• Exclusive skill workshops</li>
                <li>• Advanced recommendations & analytics</li>
                <li>• Premium support</li>
              </ul>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">Most popular</span>
                <button onClick={() => navigate('/payment')} className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg transform hover:-translate-y-0.5 transition cursor-pointer">Upgrade Now</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
