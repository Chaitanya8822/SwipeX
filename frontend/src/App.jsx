import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SwipeFeed from './pages/SwipeFeed';
import AIResumeAnalyzer from './pages/AIResumeAnalyzer';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidateSwiper from './pages/CandidateSwiper';
import Matches from './pages/Matches';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
        <Navbar />
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<SwipeFeed />} />
            <Route path="/analyze" element={<AIResumeAnalyzer />} />
            <Route path="/recruiter" element={<RecruiterDashboard />} />
            <Route path="/recruiter/swipe/:jobId" element={<CandidateSwiper />} />
            <Route path="/matches" element={<Matches />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
