import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp, FileText, Heart, Eye, Target, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8005/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(res.data);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-8 max-w-6xl mx-auto"
    >
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-blue-400" /> 
            Job Seeker Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Track your job search progress and profile performance.</p>
        </div>
        <Link to="/feed" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors">
          Find Jobs
        </Link>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/50 transition-shadow">
          <div className="w-12 h-12 bg-blue-500/200/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Applications Sent</h3>
          <p className="text-3xl font-bold text-white">{metrics?.total_applications || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/50 transition-shadow">
          <div className="w-12 h-12 bg-rose-500/200/20 text-rose-400 rounded-xl flex items-center justify-center mb-4">
            <Heart size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Successful Matches</h3>
          <p className="text-3xl font-bold text-white">{metrics?.total_matches || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/50 transition-shadow">
          <div className="w-12 h-12 bg-purple-500/200/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
            <Eye size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Profile Views</h3>
          <p className="text-3xl font-bold text-white">{metrics?.profile_views || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/50 transition-shadow">
          <div className="w-12 h-12 bg-green-500/200/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
            <Target size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Match Rate</h3>
          <p className="text-3xl font-bold text-white">
            {metrics?.total_applications > 0 
              ? Math.round((metrics.total_matches / metrics.total_applications) * 100) 
              : 0}%
          </p>
        </motion.div>
      </motion.div>
      
      {/* Recommended Actions */}
      <motion.div variants={item} className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl shadow-black/50 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">Boost your match rate! 🚀</h2>
          <p className="text-gray-300 mb-6">Use our AI Resume Analyzer to tailor your resume for specific job descriptions before applying. Candidates who use the AI Analyzer see a 40% increase in matches.</p>
          <Link to="/analyze" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-black/50 transition-colors inline-block">
            Try AI Analyzer
          </Link>
        </div>
        <div className="w-48 h-48 bg-indigo-500/200/20 rounded-full flex items-center justify-center shrink-0">
           <Briefcase size={64} className="text-indigo-400" />
        </div>
      </motion.div>

    </motion.div>
  );
}
