import React, { useState, useEffect } from 'react';
import { Building2, Sparkles, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8005/jobs/companies/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setCompanies(data);
        }
      } catch (err) {
        console.error('Failed to fetch companies', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">Explore Companies</h1>
        <p className="text-gray-400 text-lg">Discover the top startups and enterprises hiring right now on SwipeX.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {companies.map((company, index) => (
            <motion.div key={index} variants={item} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-black/50 border border-white/10 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                  <Building2 size={24} className="text-blue-400" />
                </div>
                {company.is_startup && (
                  <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber-500/20">
                    <Sparkles size={12} /> Startup
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{company.name}</h3>
              
              <div className="flex items-center gap-2 mt-4 text-sm font-medium text-gray-400 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                <Briefcase size={16} className="text-gray-400" />
                {company.active_jobs} Active Postings
              </div>
            </motion.div>
          ))}
          
          {companies.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-xl shadow-black/50">
               <Building2 size={64} className="text-gray-300 mb-4" />
               <h3 className="text-2xl font-bold text-white mb-2">No companies yet</h3>
               <p className="text-gray-400">Check back later when recruiters post more jobs.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
