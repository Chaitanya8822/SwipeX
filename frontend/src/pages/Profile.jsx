import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCircle, Briefcase, FileText, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    company_name: '',
    skills: '',
    mobile_number: '',
    portfolio_url: ''
  });
  const [message, setMessage] = useState(null);

  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setFormData({
          full_name: res.data.full_name || '',
          bio: res.data.bio || '',
          company_name: res.data.company_name || '',
          skills: res.data.skills || '',
          mobile_number: res.data.mobile_number || '',
          portfolio_url: res.data.portfolio_url || ''
        });
      } catch (err) {
        console.error("Failed to fetch profile", err);
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setMessage({ type: 'error', text: 'Failed to load profile. Please refresh.' });
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/auth/profile/image`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(res.data);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to upload image.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  if (!profile) return <div className="p-8 text-gray-400">Loading profile...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto mt-8 px-4"
    >
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-sm border border-white/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
           <div 
             className="absolute -bottom-12 left-8 w-24 h-24 bg-[#09090b] rounded-2xl shadow-xl border-4 border-[#09090b] flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition-opacity overflow-hidden group"
             onClick={() => fileInputRef.current?.click()}
           >
             {profile.profile_picture_url ? (
               <img src={profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <UserCircle size={48} className="text-gray-400" />
             )}
             
             {uploading && (
               <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
               </div>
             )}
             
             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-xs font-bold text-white">Upload</span>
             </div>
             
             <input 
               type="file" 
               ref={fileInputRef} 
               onChange={handleImageUpload} 
               accept="image/*" 
               className="hidden" 
             />
           </div>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.full_name || 'Anonymous User'}</h1>
              <p className="text-gray-400 flex items-center gap-2 mt-1">
                {profile.role === 'recruiter' ? <Briefcase size={16}/> : <FileText size={16}/>}
                {profile.role === 'recruiter' ? 'Recruiter' : 'Job Seeker'} • {profile.email}
              </p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/30 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 flex items-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <Check size={18}/> : <AlertCircle size={18}/>}
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              {profile.role === 'recruiter' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={formData.company_name}
                    onChange={e => setFormData({...formData, company_name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. TechCorp Inc."
                  />
                </div>
              )}

              {profile.role === 'job_seeker' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Top Skills (Comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.skills}
                      onChange={e => setFormData({...formData, skills: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g. React, Python, UI/UX"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Mobile Number</label>
                      <input 
                        type="text" 
                        value={formData.mobile_number}
                        onChange={e => setFormData({...formData, mobile_number: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. +1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Portfolio URL / LinkedIn</label>
                      <input 
                        type="url" 
                        value={formData.portfolio_url}
                        onChange={e => setFormData({...formData, portfolio_url: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio / About Me</label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl p-3 h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Write a little bit about yourself..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  Save Changes
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 bg-white/10 text-gray-300 rounded-xl font-bold hover:bg-white/20 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {profile.role === 'recruiter' && profile.company_name && (
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Company</h3>
                  <p className="text-gray-300 bg-white/5 p-4 rounded-xl">{profile.company_name}</p>
                </div>
              )}
              
              {profile.role === 'job_seeker' && (
                <>
                  {profile.skills && (
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.split(',').map((skill, i) => (
                          <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-semibold rounded-lg border border-white/10">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(profile.mobile_number || profile.portfolio_url) && (
                    <div className="grid grid-cols-2 gap-4">
                      {profile.mobile_number && (
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Contact</h3>
                          <p className="text-gray-300 bg-white/5 p-3 rounded-xl">{profile.mobile_number}</p>
                        </div>
                      )}
                      {profile.portfolio_url && (
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Portfolio</h3>
                          <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline bg-blue-500/20 p-3 rounded-xl block truncate">
                            {profile.portfolio_url}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">About</h3>
                <div className="text-gray-300 bg-white/5 p-4 rounded-xl min-h-[100px] whitespace-pre-wrap">
                  {profile.bio || "No bio added yet."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
