import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, MessageSquare, Briefcase, MapPin, Building2, Calendar, User, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Matches() {
  const [matches, setMatches] = useState([]);
  const [isRecruiter, setIsRecruiter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setIsRecruiter(payload.role === 'recruiter');
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/matches/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatches(res.data);
      } catch (error) {
        console.error("Error fetching matches", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-8 max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Your Matches 🎉</h1>
        <p className="text-gray-400 mt-2">
            {isRecruiter 
              ? "Candidates you've mutually matched with." 
              : "Companies that swiped right on your application!"}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl shadow-black/50">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
             <MessageSquare size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No matches yet</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            {isRecruiter 
              ? "Keep swiping! Once a candidate matches your right swipe, they will appear here." 
              : "Keep swiping! Your profile is being shown to recruiters, and matches will appear here when they swipe right back."}
          </p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {matches.map((match) => (
            <motion.div key={match.id} variants={item} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl shadow-black/50 transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
              
              {isRecruiter ? (
                <>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0 overflow-hidden">
                    {match.user?.profile_picture_url ? (
                      <img src={match.user.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {match.user?.full_name || `Candidate #${match.user_id}`}
                    </h3>
                    <p className="text-gray-300 font-medium mb-3 flex items-center gap-2">
                        <Briefcase size={16}/> Applied for: {match.job.title}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 shrink-0">
                    <Building2 size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">{match.job.title}</h3>
                      {match.job.is_startup && (
                        <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-green-500/20">Startup</span>
                      )}
                    </div>
                    <p className="text-gray-300 font-medium mb-3">{match.job.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5"><MapPin size={16}/> {match.job.location || 'Remote'}</span>
                      <span className="flex items-center gap-1.5"><Briefcase size={16}/> {match.job.job_type || 'Full-time'}</span>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 items-center justify-end">
                <span className="bg-green-500/200/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Check size={14} /> Matched
                </span>
                <Link to={`/chat/${match.id}`} className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xl shadow-black/50 flex items-center justify-center gap-2">
                  <Mail size={18} /> Message
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
