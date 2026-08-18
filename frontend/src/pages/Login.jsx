import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Building2 } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginRole, setLoginRole] = useState('job_seeker');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/auth/login`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      localStorage.setItem('token', response.data.access_token);
      const payload = JSON.parse(atob(response.data.access_token.split('.')[1]));
      
      if (payload.role === 'recruiter') {
        window.location.href = '/recruiter';
      } else {
        window.location.href = '/feed';
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSwitch = (role) => {
    setLoginRole(role);
    setError('');
    if (role === 'recruiter') {
      setEmail('recruiter@datasphere.com');
      setPassword('password123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] rounded-3xl overflow-hidden flex bg-[#09090b] shadow-2xl border border-white/5">
      {/* Hero Section (Hidden on mobile, 50% width on desktop) */}
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
            Your dream career, just a <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">swipe away.</span>
          </h1>
          
          <p className="text-base lg:text-lg text-purple-100/70 leading-relaxed font-medium max-w-md">
            SwipeX is the next-generation job matching platform connecting top talent with industry-leading companies instantly. Say goodbye to endless scrolling and hello to meaningful connections.
          </p>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-1/2 overflow-y-auto custom-scrollbar p-6 sm:p-12 z-20 relative flex flex-col">
        {/* Subtle background glow for the right side */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md relative z-10 m-auto"
        >
          <div className="bg-white/5 backdrop-blur-2xl border border-purple-500/40 p-8 sm:p-10 rounded-[2rem] shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex justify-center items-center px-5 py-2 w-fit rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 shadow-lg mb-4">
                <span className="text-2xl font-black text-white tracking-tight">SwipeX</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
              <p className="text-purple-200/60 mt-2 font-medium">
                {loginRole === 'job_seeker' ? 'Log in to continue your job search' : 'Log in to manage your candidates'}
              </p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-purple-500/20">
              <button
                type="button"
                onClick={() => handleRoleSwitch('job_seeker')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  loginRole === 'job_seeker' ? 'bg-purple-500/20 text-purple-100 shadow-sm' : 'text-gray-500 hover:text-purple-300'
                }`}
              >
                <User size={16} /> Job Seeker
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('recruiter')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  loginRole === 'recruiter' ? 'bg-purple-500/20 text-purple-100 shadow-sm' : 'text-gray-500 hover:text-purple-300'
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-purple-200 mb-1.5">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500/50 group-focus-within:text-purple-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-blue-500/20 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-200 mb-1.5">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-500/50 group-focus-within:text-purple-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-blue-500/20 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all font-medium text-white placeholder-gray-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/10 bg-black/40 text-purple-600 focus:ring-purple-500/50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-purple-200/60">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-white/10 hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all flex justify-center items-center mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
              </motion.button>
            </form>
            
            <p className="mt-8 text-center text-gray-500 font-medium text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 font-bold hover:from-blue-300 hover:to-purple-300 transition-all">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
