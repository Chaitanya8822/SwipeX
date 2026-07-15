import React from 'react';
import { MapPin, DollarSign, Building2, Tag } from 'lucide-react';

export default function JobCard({ job }) {
  const tags = job.tags ? job.tags.split(',') : [];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-sm mx-auto h-[550px] flex flex-col relative select-none">
      {/* Header Banner */}
      <div className={`h-32 p-6 flex items-end ${job.is_startup ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
        <div className="bg-white p-3 rounded-2xl shadow-md transform translate-y-8">
          <Building2 size={32} className={job.is_startup ? "text-indigo-600" : "text-blue-600"} />
        </div>
      </div>
      
      {/* Content */}
      <div className="pt-12 p-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h2>
        <p className="text-lg text-gray-600 font-medium mb-4">{job.company}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-600">
            <MapPin size={18} className="mr-2 text-gray-400" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign size={18} className="mr-2 text-gray-400" />
            <span className="text-sm font-semibold">{job.salary_range}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">About the role</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {job.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-auto">
            {tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex items-center">
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
