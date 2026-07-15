import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [role, setRole] = useState(null);

  // A very basic way to re-check token on mount. 
  // In a real app, you'd use a Context or Zustand store for global auth state.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role);
      } catch (e) {}
    }
  }, []);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SwipeX
        </Link>
        <div className="space-x-4 flex items-center">
          {role === 'recruiter' ? (
            <Link to="/recruiter" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/feed" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Swipe Jobs
              </Link>
              <Link to="/analyze" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                AI Analyzer
              </Link>
            </>
          )}
          <Link to="/matches" className="text-gray-600 hover:text-pink-600 font-medium transition-colors flex items-center gap-1">
             Matches
          </Link>
          <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors ml-4">Login</Link>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
