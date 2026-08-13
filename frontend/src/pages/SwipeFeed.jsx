import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import JobCard from '../components/JobCard';
import { X, Check, Undo2, Search, Filter, Briefcase, MapPin, DollarSign, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_JOBS = [
  { id: 1, title: 'Senior React Developer', company: 'TechNova', location: 'Remote', salary_range: '₹12L - ₹15L', description: 'Join our core team building next-generation web applications. You will be responsible for architecting and implementing complex UI features.', tags: 'React, Vite, Tailwind', is_startup: true },
  { id: 2, title: 'Machine Learning Engineer', company: 'DataSphere', location: 'San Francisco, CA', salary_range: '₹15L - ₹20L', description: 'Work on cutting-edge AI models for personalized recommendations. Experience with PyTorch and Transformers is required.', tags: 'Python, PyTorch, AI', is_startup: false },
  { id: 3, title: 'Backend Software Engineer', company: 'CloudScale', location: 'New York, NY', salary_range: '₹13L - ₹16L', description: 'Design and build high-performance APIs and microservices. We process millions of transactions per day.', tags: 'FastAPI, PostgreSQL, Docker', is_startup: true },
  { id: 4, title: 'Product Designer', company: 'PixelPerfect', location: 'Remote', salary_range: '₹9L - ₹13L', description: 'Create beautiful and intuitive user interfaces. Strong portfolio demonstrating UX/UI skills is required.', tags: 'Figma, UI/UX, Design Systems', is_startup: false },
];

export default function SwipeFeed() {
  const [jobs, setJobs] = useState([]);
  const [lastDirection, setLastDirection] = useState();
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Advanced Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    companyType: 'all', // all, startup, mnc
    location: '',
    isRemote: false,
    jobType: 'all',
    salaryRange: 'all'
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Build query string
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        
        if (filters.companyType === 'startup') params.append('is_startup', 'true');
        else if (filters.companyType === 'mnc') params.append('is_startup', 'false');
        
        if (filters.location) params.append('location', filters.location);
        if (filters.isRemote) params.append('is_remote', 'true');
        if (filters.jobType !== 'all') params.append('job_type', filters.jobType);
        if (filters.salaryRange !== 'all') params.append('salary_range', filters.salaryRange);
        
        const response = await fetch(`http://localhost:8005/jobs/recommended?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setJobs(data);
            setCurrentIndex(data.length - 1);
          } else {
            setJobs([]); // Allow empty state when filtering
            setCurrentIndex(-1);
          }
        } else {
          setJobs(MOCK_JOBS);
          setCurrentIndex(MOCK_JOBS.length - 1);
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
        setJobs(MOCK_JOBS);
        setCurrentIndex(MOCK_JOBS.length - 1);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchJobs();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filters]);

  const childRefs = React.useMemo(
    () =>
      Array(100) // max 100 jobs for now
        .fill(0)
        .map(() => React.createRef()),
    []
  );

  const swipe = async (dir) => {
    if (currentIndex >= 0 && childRefs[currentIndex]?.current) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  const swiped = async (direction, job, index) => {
    setLastDirection(direction)
    setCurrentIndex(index - 1);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const isRightSwipe = direction === 'right';
      await fetch('http://localhost:8005/swipes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: job.id,
          is_right_swipe: isRightSwipe
        })
      });
    } catch (err) {
      console.error('Failed to record swipe', err);
    }
  }

  const outOfFrame = (name) => {
    // Left screen
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] overflow-hidden pt-4 pb-20">
      
      <div className="w-full max-w-sm mb-4">
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20 rounded-xl p-3 flex items-center justify-center gap-2 shadow-xl shadow-black/50 backdrop-blur-md">
          <Sparkles size={16} className="text-blue-400 fill-blue-400 animate-pulse" />
          <span className="text-sm font-bold text-gray-300">AI Personalized Feed</span>
        </div>
      </div>

      {/* Advanced Search and Filter Bar */}
      <div className="w-full max-w-sm mb-6 flex flex-col gap-3">
        <div className="flex gap-2 relative z-20">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Roles or companies..."
              className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-2xl shadow-xl shadow-black/50 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-white bg-white/5 backdrop-blur-md"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 rounded-2xl flex items-center gap-2 font-medium shadow-xl shadow-black/50 border transition-colors backdrop-blur-md ${showFilters ? 'bg-blue-500/200/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-300'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.95 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/50 z-10 overflow-hidden flex flex-col gap-4"
            >
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Company Type</label>
                <div className="flex bg-white/5 p-1 rounded-xl">
                  {['all', 'startup', 'mnc'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilters({...filters, companyType: type})}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${filters.companyType === type ? 'bg-white/10 shadow-xl shadow-black/50 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                      {type === 'mnc' ? 'MNC' : type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <MapPin size={12} /> Location
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    placeholder="e.g. New York"
                    className="w-full border border-white/10 bg-white/5 rounded-xl p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <DollarSign size={12} /> Salary
                  </label>
                  <select 
                    value={filters.salaryRange}
                    onChange={(e) => setFilters({...filters, salaryRange: e.target.value})}
                    className="w-full border border-white/10 rounded-xl p-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none bg-gray-900"
                  >
                    <option value="all">Any Salary</option>
                    <option value="₹9L - ₹13L">₹9L - ₹13L</option>
                    <option value="₹12L - ₹15L">₹12L - ₹15L</option>
                    <option value="₹13L - ₹16L">₹13L - ₹16L</option>
                    <option value="₹15L - ₹20L">₹15L - ₹20L</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between bg-blue-500/200/10 p-3 rounded-xl border border-blue-500/20">
                <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                   <Briefcase size={16} className="text-blue-400"/> Remote Only
                </span>
                <button 
                  onClick={() => setFilters({...filters, isRemote: !filters.isRemote})}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${filters.isRemote ? 'bg-blue-500/200' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 bg-white/5 backdrop-blur-xl w-4 h-4 rounded-full shadow transition-transform ${filters.isRemote ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Cards */}
      <div className="relative w-full max-w-sm h-[650px] z-0">
        {jobs.map((job, index) => (
          <TinderCard
            ref={childRefs[index]}
            className="absolute top-0 left-0 right-0 w-full"
            key={job.id}
            onSwipe={(dir) => swiped(dir, job, index)}
            onCardLeftScreen={() => outOfFrame(job.title)}
            preventSwipe={['up', 'down']}
            swipeRequirementType="position"
          >
            <JobCard job={job} />
          </TinderCard>
        ))}
        {currentIndex === -1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md border-2 border-dashed border-white/10 rounded-3xl shadow-xl shadow-black/50">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-400">
               <Briefcase size={32} />
            </div>
            <p className="text-gray-300 font-bold text-lg">You're all caught up!</p>
            <p className="text-gray-400 text-sm mt-1 text-center px-6">Check back later or adjust your filters to see more jobs.</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 mt-8">
        <button 
          onClick={() => swipe('left')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-red-500 shadow-[0_8px_20px_rgba(244,63,94,0.4)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_12px_25px_rgba(244,63,94,0.6)] transition-all group"
        >
          <X size={32} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <button 
          onClick={() => swipe('up')}
          className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md shadow-xl shadow-black/50 border border-white/10 flex items-center justify-center text-gray-400 hover:scale-110 hover:text-blue-400 transition-all"
        >
          <Undo2 size={24} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => swipe('right')}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_8px_20px_rgba(16,185,129,0.4)] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_12px_25px_rgba(16,185,129,0.6)] transition-all group"
        >
          <Check size={32} strokeWidth={3} className="group-hover:scale-125 transition-transform duration-300" />
        </button>
      </div>
      
      {lastDirection ? (
        <h2 className="infoText mt-6 text-gray-400 font-medium animate-pulse">
          You swiped {lastDirection === 'right' ? 'Right (Applied)' : lastDirection === 'left' ? 'Left (Passed)' : lastDirection}
        </h2>
      ) : (
        <h2 className="infoText mt-6 text-gray-400 opacity-0">Placeholder</h2>
      )}
    </div>
  );
}
