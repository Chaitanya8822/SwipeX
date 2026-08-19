import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, Building2, MapPin, DollarSign, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppliedJobs() {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8005/jobs/applied', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppliedJobs(res.data);
    } catch (error) {
      console.error("Failed to fetch applied jobs", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading your applications...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Briefcase className="text-purple-400" />
          My Applications
        </h1>
        <p className="text-gray-400">Track the status of the jobs you've swiped right on.</p>
      </div>

      {appliedJobs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-xl backdrop-blur-md">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
            <Briefcase size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No applications yet</h2>
          <p className="text-gray-400 mb-6">Start swiping right on the feed to apply for jobs!</p>
          <Link to="/feed" className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors">
            Go to Swipe Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliedJobs.map((item, idx) => {
            const job = item.job;
            const tags = job.tags ? job.tags.split(',') : [];
            const isMatched = item.status === 'Matched';
            
            return (
              <div key={idx} className={`bg-white/5 backdrop-blur-xl border ${isMatched ? 'border-green-500/30' : 'border-white/10'} rounded-2xl p-6 flex flex-col relative shadow-xl shadow-black/50 transition-colors`}>
                
                <div className="absolute top-4 right-4">
                  {isMatched ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold border border-green-500/30">
                      <CheckCircle2 size={14} /> Matched!
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30">
                      <Clock size={14} /> Pending
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mb-4 mt-2">
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
                    Applied
                  </span>
                  {isMatched && (
                    <Link to="/matches" className="text-sm font-bold text-green-400 hover:text-green-300 transition-colors">
                      View Match →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
