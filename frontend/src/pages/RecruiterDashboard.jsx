import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Heart, Briefcase, PlusCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterDashboard() {
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
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
            <LayoutDashboard className="text-blue-400" /> 
            Recruiter Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Overview of your active job postings and candidate pipeline.</p>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
      >
        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-500/200/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
            <Briefcase size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Active Jobs</h3>
          <p className="text-3xl font-bold text-white">{metrics?.total_jobs || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-500/200/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Pipeline Applicants</h3>
          <p className="text-3xl font-bold text-white">{metrics?.total_applicants || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-rose-500/200/20 text-rose-400 rounded-xl flex items-center justify-center mb-4">
            <Heart size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Total Matches</h3>
          <p className="text-3xl font-bold text-white">{metrics?.total_matches || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-500/200/20 text-green-400 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Conversion Rate</h3>
          <p className="text-3xl font-bold text-white">{metrics?.pipeline_conversion_rate || 0}%</p>
        </motion.div>
      </motion.div>

    </motion.div>
  );
}
