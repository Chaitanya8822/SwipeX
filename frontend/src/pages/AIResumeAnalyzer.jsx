import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AIResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Fetch available jobs to compare against
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8005/jobs/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data);
        if (res.data.length > 0) setSelectedJob(res.data[0].id);
      } catch (err) {
        console.error("Failed to fetch jobs", err);
      }
    };
    fetchJobs();
  }, []);

  const handleAnalyze = async () => {
    if (!file || !selectedJob) return;
    
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_id', selectedJob);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:8005/resume/analyze', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setResult(res.data);
    } catch (err) {
      console.error("Analysis failed", err);
      alert("Failed to analyze resume. Please check the backend.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 flex flex-col gap-8 md:flex-row">
      
      {/* Upload Section */}
      <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
          <BrainCircuit size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Resume Analyzer</h2>
        <p className="text-gray-500 text-center mb-8">
          Upload your resume to see how well you match with a job description.
        </p>

        <div className="w-full mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select a Target Job</label>
          <select 
            value={selectedJob || ''} 
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-blue-600 outline-none"
          >
            {jobs.length === 0 && <option>No jobs available yet...</option>}
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title} at {job.company}</option>
            ))}
          </select>
        </div>

        <div className="w-full border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors relative">
          <input 
            type="file" 
            accept=".pdf,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <div className="flex flex-col items-center text-blue-600">
              <FileText size={40} className="mb-3" />
              <span className="font-semibold">{file.name}</span>
              <span className="text-xs text-blue-400 mt-1">Click to replace</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <UploadCloud size={40} className="mb-3" />
              <span className="font-medium text-gray-600">Click to upload PDF or TXT</span>
            </div>
          )}
        </div>

        <button 
          onClick={handleAnalyze}
          disabled={!file || !selectedJob || isAnalyzing}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
        >
          {isAnalyzing ? (
             <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
          ) : (
             <>Analyze Resume</>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Analysis Results</h3>
          
          <div className="flex items-center justify-between mb-8">
            <span className="text-gray-600 font-medium">ATS Match Score</span>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-extrabold ${result.score > 75 ? 'text-green-500' : 'text-yellow-500'}`}>
                {result.score}%
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Missing Keywords</h4>
            {result.missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full font-semibold border border-red-100">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center text-green-600 gap-2 text-sm font-medium">
                <CheckCircle2 size={16} /> All key skills found!
              </div>
            )}
          </div>

          <div className="mt-auto bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertCircle size={16} className="text-blue-500"/>
              AI Suggestion
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {result.suggestions}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
