import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, HeartHandshake, Briefcase, Sparkles, Navigation, Building2, User, Bookmark } from 'lucide-react';
import axios from 'axios';

export default function Sidebar() {
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role);
        
        // Fetch user profile to get the full name and picture
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8005'}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          if (res.data.full_name) {
            setUserName(res.data.full_name);
          } else {
            setUserName(payload.role.replace('_', ' '));
          }
          if (res.data.profile_picture_url) {
            setProfilePic(res.data.profile_picture_url);
          }
        }).catch(err => {
          setUserName(payload.role.replace('_', ' '));
        });
        
      } catch (e) {}
    }
  }, [location.pathname]);

  if (['/login', '/register'].includes(location.pathname)) return null;
  if (!role) return null;

  const jobSeekerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Swipe Jobs', path: '/feed', icon: <Navigation size={20} /> },
    { name: 'Saved Jobs', path: '/saved-jobs', icon: <Bookmark size={20} /> },
    { name: 'Applied Jobs', path: '/applied-jobs', icon: <Briefcase size={20} /> },
    { name: 'Companies', path: '/companies', icon: <Building2 size={20} /> },
    { name: 'Matches', path: '/matches', icon: <HeartHandshake size={20} /> },
    { name: 'AI Analyzer', path: '/analyze', icon: <Sparkles size={20} /> },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', path: '/recruiter', icon: <LayoutDashboard size={20} /> },
    { name: 'Jobs', path: '/recruiter/jobs', icon: <Briefcase size={20} /> },
    { name: 'Matches', path: '/matches', icon: <HeartHandshake size={20} /> },
  ];

  const links = role === 'recruiter' ? recruiterLinks : jobSeekerLinks;

  return (
    <div className="w-64 bg-[#09090b] border-r border-white/5 h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6 border-b border-white/5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
          S
        </div>
        <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          SwipeX
        </Link>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3 mt-4">
          Menu
        </div>
        <nav className="flex flex-col space-y-1.5">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:scale-[1.02]'
                }`
              }
            >
              <div className="transition-transform group-hover:scale-110">
                {link.icon}
              </div>
              {link.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-white/5">
        <NavLink 
          to="/profile"
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-300 group ${
              isActive 
                ? 'bg-blue-900/30 text-blue-400 border border-blue-500/30' 
                : 'hover:bg-white/5 border border-transparent'
            }`
          }
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors overflow-hidden ${location.pathname === '/profile' ? 'bg-blue-900/50 text-blue-400' : 'bg-white/5 text-gray-400'}`}>
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="overflow-hidden">
            <p className={`text-sm font-bold capitalize truncate ${location.pathname === '/profile' ? 'text-blue-400' : 'text-gray-200'}`}>{userName || role.replace('_', ' ')}</p>
            <p className={`text-xs font-medium ${location.pathname === '/profile' ? 'text-blue-500/70' : 'text-gray-500'}`}>My Profile</p>
          </div>
        </NavLink>
      </div>
    </div>
  );
}
