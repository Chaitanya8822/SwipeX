import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookmarkMinus, Building2, MapPin, DollarSign, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8005/jobs/saved', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedJobs(res.data);
    } catch (error) {
      console.error("Failed to fetch saved jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8005/jobs/${jobId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedJobs(savedJobs.filter(item => item.job.id !== jobId));
    } catch (error) {
      console.error("Failed to remove saved job", error);
    }
  };

  const handleAction = async (jobId, isApply) => {
    try {
      const token = localStorage.getItem('token');
      // 1. Record the swipe action (apply or pass)
      await axios.post('http://localhost:8005/swipes/', {
        job_id: jobId,
        is_right_swipe: isApply
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. Remove it from saved jobs in DB
      await axios.post(`http://localhost:8005/jobs/${jobId}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 3. Remove it from UI
      setSavedJobs(savedJobs.filter(item => item.job.id !== jobId));
    } catch (error) {
      console.error("Failed to process action", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading your saved jobs...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Saved Jobs 📌</h1>
        <p className="text-gray-400">Jobs you've bookmarked for later review.</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
            <BookmarkMinus size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No saved jobs yet</h2>
          <p className="text-gray-400 mb-6">Hit the bookmark button on the Swipe Feed to save jobs here.</p>
          <Link to="/feed" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
            Go to Swipe Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((item) => {
            const job = item.job;
            const tags = job.tags ? job.tags.split(',') : [];
            
            return (
              <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative shadow-xl shadow-black/50 hover:border-blue-500/30 transition-colors">
                <button 
                  onClick={() => removeSavedJob(job.id)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition-colors"
                  title="Remove from saved"
                >
                  <BookmarkMinus size={20} />
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${job.is_startup ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400'} border border-white/10`}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{job.title}</h3>
                    <p className="text-sm text-gray-400 font-medium">{job.company}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <DollarSign size={16} className="mr-2 text-gray-500" />
                    {job.salary_range}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded-md">
                      {tag.trim()}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="px-2 py-1 text-gray-500 text-xs rounded-md">+{tags.length - 3} more</span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    Saved {new Date(item.saved_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(job.id, false)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-sm font-semibold transition-all"
                    >
                      Pass
                    </button>
                    <button 
                      onClick={() => handleAction(job.id, true)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
