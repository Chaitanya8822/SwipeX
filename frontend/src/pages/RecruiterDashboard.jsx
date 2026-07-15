import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Briefcase, Users, ChevronRight } from 'lucide-react';

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', company: '', location: '', salary_range: '', description: '', tags: '', is_startup: false
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const res = await axios.get('http://localhost:8005/jobs/my-jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8005/jobs/', newJob, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowForm(false);
      fetchMyJobs();
    } catch (err) {
      console.error("Failed to post job", err);
      if (err.response && err.response.status === 401) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        alert("Failed to publish job. Please check your inputs.");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h2>
          <p className="text-gray-500 mt-1">Manage your job postings and review candidates.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <PlusCircle size={20} />
          {showForm ? 'Cancel' : 'Post New Job'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handlePostJob} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Job Title" required className="p-3 border rounded-xl" onChange={e => setNewJob({...newJob, title: e.target.value})} />
            <input type="text" placeholder="Company" required className="p-3 border rounded-xl" onChange={e => setNewJob({...newJob, company: e.target.value})} />
            <input type="text" placeholder="Location" required className="p-3 border rounded-xl" onChange={e => setNewJob({...newJob, location: e.target.value})} />
            <input type="text" placeholder="Salary Range" className="p-3 border rounded-xl" onChange={e => setNewJob({...newJob, salary_range: e.target.value})} />
          </div>
          <textarea placeholder="Job Description" required className="w-full p-3 border rounded-xl h-32" onChange={e => setNewJob({...newJob, description: e.target.value})} />
          <input type="text" placeholder="Tags (comma separated)" className="w-full p-3 border rounded-xl" onChange={e => setNewJob({...newJob, tags: e.target.value})} />
          
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow">Publish Job</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase size={24} />
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{job.location}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-gray-500 text-sm mb-6">{job.company}</p>
            
            <Link to={`/recruiter/swipe/${job.id}`} className="w-full bg-gray-50 hover:bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-gray-200 hover:border-blue-200">
              <Users size={18} /> Review Candidates <ChevronRight size={18} />
            </Link>
          </div>
        ))}
        {jobs.length === 0 && !showForm && (
          <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">You haven't posted any jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
