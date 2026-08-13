import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  
  const [role, setRole] = useState(null);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role);
        
        // Fetch notifications
        fetchNotifications(token);
      } catch (e) {}
    }
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location.pathname]);

  const fetchNotifications = async (token) => {
    try {
      const res = await axios.get('http://localhost:8005/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8005/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setRole(null);
    navigate('/login');
  };
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className={`bg-[#09090b]/80 backdrop-blur-md border-white/5 border-b sticky top-0 z-50 transition-colors`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className={`text-xl font-bold lg:hidden text-white`}>SwipeX</Link>
          </div>
          <div className="flex items-center gap-4">
            {role && (
              <div className="flex items-center gap-4">
                
                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-[#09090b]"></span>
                      </span>
                    )}
                  </button>
                  
                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#121214] border border-white/10 rounded-xl shadow-2xl py-2 z-50 origin-top-right">
                      <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                        <h3 className="font-bold text-gray-200">Notifications</h3>
                        {unreadCount > 0 && <span className="text-xs bg-blue-900/30 text-blue-400 font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            You have no notifications yet.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => { if(!n.is_read) markAsRead(n.id); }}
                              className={`px-4 py-3 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${!n.is_read ? 'bg-blue-900/10' : ''}`}
                            >
                              <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-200' : 'text-gray-400'}`}>
                                {n.message}
                              </p>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-sm font-semibold px-3 py-1 bg-white/10 border border-white/5 rounded-full text-gray-300 hidden md:block">
                  {role.replace('_', ' ').toUpperCase()}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
            {!role && (
              <div className="flex gap-3">
                <Link to="/login" className="px-4 py-2 text-blue-400 font-medium border border-blue-500/30 rounded-lg hover:bg-blue-900/20 transition-colors shadow-sm">Login</Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
