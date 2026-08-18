import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { User, Mail, Sparkles, X, Check, ArrowLeft, Heart } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function CandidateSwiper() {
  const { jobId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [matchPopup, setMatchPopup] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const childRefs = React.useMemo(
    () =>
      Array(100)
        .fill(0)
        .map(() => React.createRef()),
    []
  );

  const swipe = async (dir) => {
    if (currentIndex >= 0 && childRefs[currentIndex]?.current) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/jobs/${jobId}/candidates`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCandidates(data);
          setCurrentIndex(data.length - 1);
        }
      } catch (err) {
        console.error('Failed to fetch candidates', err);
      }
    };
    fetchCandidates();
  }, [jobId]);

  const swiped = async (direction, candidate, index) => {
    setLastDirection(direction);
    setCurrentIndex(index - 1);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const isRightSwipe = direction === 'right';
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/swipes/recruiter`, null, {
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
        <Link to="/recruiter/jobs" className="text-gray-400 hover:text-blue-400 flex items-center gap-2 font-medium">
          <ArrowLeft size={18} /> Back to Jobs
        </Link>
      </div>

      <div className="relative w-full max-w-sm h-[500px]">
        {candidates.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/5 backdrop-blur-md rounded-3xl shadow-sm border border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No candidates yet!</h3>
            <p className="text-gray-400">Wait for job seekers to apply to your job.</p>
          </div>
        ) : (
          candidates.map((candidate, index) => (
            <TinderCard
              className="absolute top-0 left-0 right-0 w-full"
              key={candidate.id}
              ref={childRefs[index]}
              onSwipe={(dir) => swiped(dir, candidate, index)}
              onCardLeftScreen={() => outOfFrame(candidate.email)}
              preventSwipe={['up', 'down']}
              swipeRequirementType="position"
            >
              <div className="bg-white/5 backdrop-blur-xl w-full h-[500px] rounded-3xl shadow-xl overflow-hidden border border-white/10 flex flex-col cursor-grab active:cursor-grabbing">
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
                  <div className="flex flex-col gap-3 mb-6 bg-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="text-blue-400 shrink-0" size={20} />
                      <div className="truncate">
                        <p className="font-medium text-white truncate">{candidate.email}</p>
                      </div>
                    </div>
                    {candidate.mobile_number && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-5 flex justify-center shrink-0">
                           <span className="text-blue-400 text-lg">📱</span>
                        </div>
                        <div className="truncate">
                          <p className="font-medium text-white truncate">{candidate.mobile_number}</p>
                        </div>
                      </div>
                    )}
                    {candidate.portfolio_url && (
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-5 flex justify-center shrink-0">
                           <span className="text-blue-400 text-lg">🔗</span>
                        </div>
                        <div className="truncate">
                          <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-400 hover:underline truncate block">
                            {candidate.portfolio_url}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex gap-2">
                       <span className="bg-purple-500/200/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold">Top Candidate</span>
                       <span className="bg-blue-500/200/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold">Applied Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </TinderCard>
          ))
        )}

        {/* Match Popup Overlay */}
        {matchPopup && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md rounded-3xl animate-in fade-in duration-200">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl text-center transform scale-110 shadow-2xl border border-white/10">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                 <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 mb-2">
                IT'S A MATCH!
              </h2>
              <p className="text-gray-300 font-medium">You and {matchPopup.email.split('@')[0]} liked each other.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 mt-8">
        <button 
          onClick={() => swipe('left')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-red-500 shadow-[0_8px_20px_rgba(244,63,94,0.4)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_12px_25px_rgba(244,63,94,0.6)] transition-all group"
        >
          <X size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <button 
          onClick={() => swipe('right')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_8px_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_12px_25px_rgba(16,185,129,0.6)] transition-all group"
        >
          <Heart size={32} strokeWidth={3} className="group-hover:scale-125 transition-transform duration-300" />
        </button>
      </div>

    </div>
  );
}
