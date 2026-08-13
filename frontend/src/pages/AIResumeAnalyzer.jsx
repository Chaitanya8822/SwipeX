import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrainCircuit, UploadCloud, FileText, CheckCircle2, AlertCircle, XCircle, Award, Zap, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const CircularProgress = ({ value, label, colorClass }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r={radius} className="stroke-white/10" strokeWidth="8" fill="none" />
          <motion.circle 
            cx="48" 
            cy="48" 
            r={radius} 
            className={colorClass}
            strokeWidth="8" 
            fill="none" 
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-xl font-extrabold text-white">{Math.round(value)}%</span>
        </div>
      </div>
      <span className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">{label}</span>
    </div>
  );
};

export default function AIResumeAnalyzer() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8005/jobs/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJob(res.data[0].id);
      } catch (err) {
        console.error("Failed to load jobs", err);
      }
    };
    fetchJobs();
  }, []);

  const handleAnalyze = async () => {
    if (!file || !selectedJob) {
      alert("Please select a job and upload a resume.");
      return;
    }
    
    setIsAnalyzing(true);
    setResult(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', selectedJob);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8005/resume/analyze', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      setResult(res.data);
    } catch (err) {
      console.error("Analysis failed", err);
      const errMsg = err.response?.data?.detail || "Failed to analyze resume. Please check the backend.";
      alert(errMsg);
    } finally {
      setIsAnalyzing(false);
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

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8">
      {/* Upload Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl shadow-black/50 border border-white/10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-blue-500/200/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4">
            <BrainCircuit size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Resume Analyzer</h1>
          <p className="text-gray-400 max-w-lg">Upload your resume to see how well you match with a job description.</p>
        </div>

        <div className="w-full max-w-2xl mx-auto mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select a Target Job</label>
          <select 
            value={selectedJob || ''} 
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full border border-white/10 rounded-xl p-3 bg-white/5 text-white focus:ring-2 focus:ring-blue-600 outline-none"
          >
            {jobs.length === 0 && <option>No jobs available yet...</option>}
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title} at {job.company}</option>
            ))}
          </select>
        </div>

        <div className="w-full max-w-2xl mx-auto border-2 border-dashed border-blue-500/30 bg-blue-500/200/10 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-500/200/20 transition-colors relative">
          <input 
            type="file" 
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex flex-col items-center text-blue-400">
              <FileText size={40} className="mb-3" />
              <span className="font-semibold">{file.name}</span>
              <span className="text-xs text-blue-400 mt-1">Click to replace</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <UploadCloud size={40} className="mb-3" />
              <span className="font-medium text-gray-400">Click to upload PDF or TXT</span>
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <button 
            onClick={handleAnalyze}
            disabled={!file || !selectedJob || isAnalyzing}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
          >
            {isAnalyzing ? (
               <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing Document...</>
            ) : (
               <>Analyze Resume</>
            )}
          </button>
        </div>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Top Level Metrics */}
          <motion.div variants={item} className="md:col-span-3 bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl shadow-black/50 border border-white/10 flex flex-col md:flex-row justify-around items-center gap-8">
             <CircularProgress value={result.score} label="Overall ATS Match" colorClass="stroke-blue-500" />
             <div className="hidden md:block w-px h-16 bg-white/10"></div>
             <CircularProgress value={result.formatting_score} label="Formatting Score" colorClass="stroke-purple-500" />
             <div className="hidden md:block w-px h-16 bg-white/10"></div>
             <CircularProgress value={result.readability_score} label="Readability Score" colorClass="stroke-green-500" />
          </motion.div>

          {/* Keyword Match Analysis */}
          <motion.div variants={item} className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl shadow-black/50 border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} /> Keyword Match Analysis
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Matching Skills</h4>
                {result.matching_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.matching_skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-500/200/20 text-green-400 text-sm rounded-full font-bold border border-green-500/20 flex items-center gap-1">
                        <CheckCircle2 size={14} /> {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No exact keyword matches found.</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Missing Skills to Add</h4>
                {result.missing_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-full font-bold border border-red-500/20 flex items-center gap-1">
                        <XCircle size={14} /> {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-green-400 font-bold text-sm">You have all the key skills!</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Highlights & Feedback */}
          <motion.div variants={item} className="md:col-span-1 flex flex-col gap-6">
            
            {/* Strong Points */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-[2rem] p-6 border border-blue-500/20 flex-1">
               <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Award size={18} className="text-blue-400" /> Strengths
               </h3>
               <ul className="space-y-3">
                 {result.strong_points.map((point, i) => (
                   <li key={i} className="text-sm text-blue-200 font-medium flex items-start gap-2">
                     <span className="text-blue-500 mt-0.5">•</span> {point}
                   </li>
                 ))}
               </ul>
            </div>

            {/* AI Action Plan */}
            <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-[2rem] p-6 border border-rose-500/20 flex-1">
               <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Lightbulb size={18} className="text-rose-400" /> Action Plan
               </h3>
               <ul className="space-y-3">
                 {result.suggestions.map((sug, i) => (
                   <li key={i} className="text-sm text-rose-200 font-medium flex items-start gap-2">
                     <span className="text-rose-500 mt-0.5">•</span> {sug}
                   </li>
                 ))}
               </ul>
            </div>

          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
