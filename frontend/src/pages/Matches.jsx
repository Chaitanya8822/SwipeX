import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Building2, User, Mail, Check } from 'lucide-react';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [isRecruiter, setIsRecruiter] = useState(false);

  useEffect(() => {
    // Determine role based on token (Ideally we store role in localStorage explicitly)
    // For now, we'll try to fetch matches. The backend automatically handles the role logic!
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('token');
        // Let's decode the token to find the role
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsRecruiter(payload.role === 'recruiter');
        }

        const res = await axios.get('http://localhost:8005/matches/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatches(res.data);
      } catch (err) {
        console.error("Failed to fetch matches", err);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles size={28} className="text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Matches</h2>
          <p className="text-gray-500 mt-1">
            {isRecruiter 
              ? "Candidates you've mutually matched with." 
              : "Companies that swiped right on your application!"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {matches.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center">
            <Sparkles size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">No matches yet. Keep swiping!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {matches.map((match) => (
              <li key={match.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                
                {isRecruiter ? (
                  // Recruiter View: Shows candidate details
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Candidate #{match.user_id}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Building2 size={14} /> Applied for: {match.job.title}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Job Seeker View: Shows job details
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{match.job.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        {match.job.company} • {match.job.location}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-end gap-2">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                     <Check size={14} /> Matched
                  </span>
                  {/* Mock contact button */}
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-1">
                    <Mail size={16} /> Contact
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
