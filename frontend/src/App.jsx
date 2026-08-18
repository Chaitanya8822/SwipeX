import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SwipeFeed from './pages/SwipeFeed';
import AIResumeAnalyzer from './pages/AIResumeAnalyzer';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateSwiper from './pages/CandidateSwiper';
import Matches from './pages/Matches';
import Companies from './pages/Companies';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import SavedJobs from './pages/SavedJobs';
import RecruiterJobs from './pages/RecruiterJobs';
import Chat from './pages/Chat';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className={`min-h-screen font-sans flex bg-[#09090b] text-white`}>
      <Sidebar />
      <div className={`flex-1 flex flex-col h-screen min-w-0 ${isAuthPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<SwipeFeed />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/analyze" element={<AIResumeAnalyzer />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
            <Route path="/recruiter/swipe/:jobId" element={<CandidateSwiper />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/chat/:matchId" element={<Chat />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
