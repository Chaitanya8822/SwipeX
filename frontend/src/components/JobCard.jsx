import React from 'react';
import { MapPin, DollarSign, Building2, Tag, Flame, TrendingUp, Rocket } from 'lucide-react';

export default function JobCard({ job }) {
  const tags = job.tags ? job.tags.split(',') : [];

  const renderCompetitionBadge = () => {
    if (!job.competition_level) return null;
    
    if (job.competition_level === 'High') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-bold w-fit mb-6">
          <Flame size={14} className="animate-pulse" />
          High Demand
        </div>
      );
    } else if (job.competition_level === 'Medium') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold w-fit mb-6">
          <TrendingUp size={14} />
          Medium Competition
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-bold w-fit mb-6">
          <Rocket size={14} />
          Be the first!
        </div>
      );
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-xl border border-white/10 overflow-hidden w-full max-w-sm mx-auto h-[650px] flex flex-col relative select-none">
      {/* Header Banner */}
      <div className={`h-24 p-6 flex items-end ${job.is_startup ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
        <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/20 p-2.5 rounded-2xl shadow-2xl transform translate-y-8">
          <Building2 size={28} className="text-white drop-shadow-lg" />
        </div>
      </div>
      
      {/* Content */}
      <div className="pt-12 p-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-1">{job.title}</h2>
        <p className="text-lg text-gray-300 font-medium mb-4">{job.company}</p>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-300">
            <MapPin size={18} className="mr-2 text-gray-400" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <DollarSign size={18} className="mr-2 text-gray-400" />
            <span className="text-sm font-semibold">{job.salary_range}</span>
          </div>
        </div>

        {renderCompetitionBadge()}

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">About the role</h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            {job.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs rounded-full font-medium flex items-center">
                <Tag size={12} className="mr-1 opacity-50" />
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Startup Badge */}
      {job.is_startup && (
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/40 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          Startup
        </div>
      )}
    </div>
  );
}
