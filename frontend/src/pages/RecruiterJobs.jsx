import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Briefcase, PlusCircle, Building2, MapPin, DollarSign, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary_range: '',
    description: '',
    tags: '',
    is_startup: false,
    job_type: 'Full-time',
    experience_level: 'Mid-Level',
    is_remote: false
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:8005/jobs/my-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8005/jobs/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({
        title: '',
        company: '',
        location: '',
        salary_range: '',
        description: '',
        tags: '',
        is_startup: false,
        job_type: 'Full-time',
        experience_level: 'Mid-Level',
        is_remote: false
      });
      fetchJobs();
    } catch (error) {
      console.error("Failed to post job", error);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      className="p-8 max-w-6xl mx-auto relative"
    >
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Briefcase className="text-blue-400" /> 
            My Job Postings
          </h1>
          <p className="text-gray-400 mt-2">Manage your job listings and track applicants.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <PlusCircle size={20} />
          Post New Job
        </button>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {jobs.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-dashed border-white/10 backdrop-blur-md">
             <Briefcase size={48} className="text-white/10 mb-4" />
             <h3 className="text-xl font-bold text-white mb-2">No jobs posted yet</h3>
             <p className="text-gray-400 mb-6 text-center max-w-md">You haven't posted any jobs yet. Create a new job posting to start finding the perfect candidates.</p>
             <button 
                onClick={() => setShowModal(true)}
                className="px-6 py-2.5 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Create First Job
              </button>
          </div>
        ) : (
          jobs.map(job => (
            <motion.div key={job.id} variants={item} className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-sm hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                 <span className="px-3 py-1 bg-green-500/200/20 text-green-400 rounded-full text-xs font-bold border border-white/10">Active</span>
              </div>
              <div className="w-12 h-12 bg-blue-500/200/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
              <p className="text-gray-400 font-medium text-sm mb-4">{job.company}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-300 text-sm">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  {job.location} {job.is_remote ? '(Remote)' : ''}
                </div>
                <div className="flex items-center text-gray-300 text-sm">
                  <DollarSign size={16} className="mr-2 text-gray-400" />
                  {job.salary_range}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                 <Link to={`/recruiter/swipe/${job.id}`} className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    View Candidates →
                 </Link>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Post Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10"
          >
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-xl font-bold text-white">Post a New Job</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-300 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="jobForm" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-1.5">Job Title</label>
                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all font-medium text-white placeholder-gray-500" placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-1.5">Company Name</label>
                    <input required type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all font-medium text-white placeholder-gray-500" placeholder="e.g. TechNova" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-1.5">Location</label>
                    <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all font-medium text-white placeholder-gray-500" placeholder="e.g. San Francisco, CA" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-1.5">Salary Range</label>
                    <input required type="text" name="salary_range" value={formData.salary_range} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all font-medium text-white placeholder-gray-500" placeholder="e.g. $120k - $150k" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5">Job Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all font-medium text-white placeholder-gray-500 resize-none" placeholder="Describe the role, responsibilities, and requirements..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5">Tags (comma separated)</label>
                  <input required type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 outline-none transition-all font-medium text-white placeholder-gray-500" placeholder="e.g. React, TypeScript, Node.js" />
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="is_startup" checked={formData.is_startup} onChange={handleInputChange} className="w-5 h-5 rounded text-blue-400 focus:ring-blue-500 bg-white/5 border-white/10" />
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">Startup Company</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="is_remote" checked={formData.is_remote} onChange={handleInputChange} className="w-5 h-5 rounded text-blue-400 focus:ring-blue-500 bg-white/5 border-white/10" />
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">Remote Position</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end gap-3 sticky bottom-0 backdrop-blur-md">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-gray-300 font-bold hover:bg-white/10 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" form="jobForm" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors">
                Publish Job
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}
