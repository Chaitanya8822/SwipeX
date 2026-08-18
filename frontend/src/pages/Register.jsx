import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Building2, Phone } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job_seeker');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        email,
        password,
        role,
        full_name: fullName || null,
        mobile_number: mobileNumber || null,
        company_name: role === 'recruiter' ? companyName : null,
      };

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/auth/register`, payload);
      
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);
      const loginRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/auth/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', loginRes.data.access_token);
      const decodedPayload = JSON.parse(atob(loginRes.data.access_token.split('.')[1]));
      
      if (decodedPayload.role === 'recruiter') {
        window.location.href = '/recruiter';
      } else {
        window.location.href = '/feed';
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] rounded-3xl overflow-hidden flex bg-[#09090b] shadow-2xl border border-white/5">
      {/* Hero Section */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-[#2A162B] overflow-hidden border-r border-purple-500/10">
        {/* Subtle gradient overlay to blend edges */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#09090b]/90 pointer-events-none" />

        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-center h-full max-w-xl">
          <div className="inline-flex justify-center items-center px-6 py-3 w-fit rounded-[1.25rem] bg-gradient-to-tr from-blue-600 to-purple-600 shadow-2xl mb-8 border border-white/10">
            <span className="text-3xl font-black text-white tracking-tight">SwipeX</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5 leading-tight">
            Discover opportunities that <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">match your ambition.</span>
          </h1>
          
          <p className="text-base lg:text-lg text-purple-100/70 leading-relaxed font-medium max-w-md">
            Create your SwipeX account today. Whether you're looking for your next big role or searching for top-tier talent, your perfect match is waiting for you.
          </p>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="w-full lg:w-1/2 overflow-y-auto custom-scrollbar p-6 sm:p-12 z-20 relative flex flex-col">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md relative z-10 m-auto"
        >
          <div className="bg-white/5 backdrop-blur-2xl border border-white/40 p-8 sm:p-10 rounded-[2rem] shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-flex justify-center items-center px-4 py-2 w-fit rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-lg mb-3">
                <span className="text-xl font-black text-white tracking-tight">SwipeX</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
              <p className="text-gray-400 mt-1 font-medium text-sm">Join SwipeX to discover opportunities</p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
              <button
                type="button"
                onClick={() => setRole('job_seeker')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                  role === 'job_seeker' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <User size={16} /> Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setRole('recruiter')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                  role === 'recruiter' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Building2 size={16} /> Recruiter
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center font-medium">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {role === 'recruiter' && (
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1">Company Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                      <Building2 size={18} />
                    </div>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                      placeholder="Tech Corp"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-[0_0_15px_rgba(147,51,234,0.5)] border border-purple-400 hover:shadow-[0_0_25px_rgba(147,51,234,0.7)] transition-all flex justify-center items-center mt-6"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
              </motion.button>
            </form>
            
            <p className="mt-6 text-center text-gray-500 font-medium text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
