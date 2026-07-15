import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { User, Mail, Sparkles, X, Check, ArrowLeft } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CandidateSwiper() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [matchPopup, setMatchPopup] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8005/jobs/${jobId}/candidates`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCandidates(data);
        }
      } catch (err) {
        console.error('Failed to fetch candidates', err);
      }
    };
    fetchCandidates();
  }, [jobId]);

  const swiped = async (direction, candidate) => {
    setLastDirection(direction);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const isRightSwipe = direction === 'right';
      const res = await axios.post('http://localhost:8005/swipes/recruiter', null, {
        params: {
          job_id: jobId,
          candidate_id: candidate.id,
          is_right_swipe: isRightSwipe
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.status === 'matched') {
        setMatchPopup(candidate);
        setTimeout(() => setMatchPopup(null), 3000); // hide after 3 seconds
      }
    } catch (err) {
      console.error('Failed to record swipe', err);
    }
  }

  const outOfFrame = (name) => {
    console.log(name + ' left the screen!')
  }

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] w-full overflow-hidden">
      
      <div className="w-full max-w-sm mb-4">
        <Link to="/recruiter" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 font-medium">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
      </div>

      <div className="relative w-full max-w-sm h-[500px]">
        {candidates.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No candidates yet!</h3>
            <p className="text-gray-500">Wait for job seekers to apply to your job.</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <TinderCard
              className="absolute top-0 left-0 right-0 w-full"
              key={candidate.id}
              onSwipe={(dir) => swiped(dir, candidate)}
              onCardLeftScreen={() => outOfFrame(candidate.email)}
              preventSwipe={['up', 'down']}
            >
              <div className="bg-white w-full h-[500px] rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col cursor-grab active:cursor-grabbing">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-col relative">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white/30 mb-3">
                     <User size={48} />
                  </div>
                  <h2 className="text-xl font-bold">{candidate.email.split('@')[0]}</h2>
                  
                  {/* Subtle hint text inside the card */}
                  <div className="absolute bottom-4 left-4 flex items-center text-white/80 text-sm font-semibold">
                    <X size={16} className="mr-1" /> Skip
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center text-white/80 text-sm font-semibold">
                    Match <Check size={16} className="ml-1" />
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 text-gray-600 mb-6 bg-gray-50 p-4 rounded-2xl">
                    <Mail className="text-blue-500" size={24} />
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                      <p className="font-medium text-gray-900 truncate">{candidate.email}</p>
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex gap-2">
                       <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">Top Candidate</span>
                       <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Applied Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </TinderCard>
          ))
        )}

        {/* Match Popup Overlay */}
        {matchPopup && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-3xl text-center transform scale-110 shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-2">
                IT'S A MATCH!
              </h2>
              <p className="text-gray-600 font-medium">You and {matchPopup.email.split('@')[0]} liked each other.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
