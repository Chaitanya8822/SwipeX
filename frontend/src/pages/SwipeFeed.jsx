import React, { useState, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import JobCard from '../components/JobCard';
import { X, Heart, Undo2 } from 'lucide-react';

// Mock data until API is fully seeded
const MOCK_JOBS = [
  { id: 1, title: 'Senior React Developer', company: 'TechNova', location: 'Remote', salary_range: '$120k - $150k', description: 'Join our core team building next-generation web applications. You will be responsible for architecting and implementing complex UI features.', tags: 'React, Vite, Tailwind', is_startup: true },
  { id: 2, title: 'Machine Learning Engineer', company: 'DataSphere', location: 'San Francisco, CA', salary_range: '$150k - $200k', description: 'Work on cutting-edge AI models for personalized recommendations. Experience with PyTorch and Transformers is required.', tags: 'Python, PyTorch, AI', is_startup: false },
  { id: 3, title: 'Backend Software Engineer', company: 'CloudScale', location: 'New York, NY', salary_range: '$130k - $160k', description: 'Design and build high-performance APIs and microservices. We process millions of transactions per day.', tags: 'FastAPI, PostgreSQL, Docker', is_startup: true },
  { id: 4, title: 'Product Designer', company: 'PixelPerfect', location: 'Remote', salary_range: '$90k - $130k', description: 'Create beautiful and intuitive user interfaces. Strong portfolio demonstrating UX/UI skills is required.', tags: 'Figma, UI/UX, Design Systems', is_startup: false },
];

export default function SwipeFeed() {
  const [jobs, setJobs] = useState([]);
  const [lastDirection, setLastDirection] = useState();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8005/jobs/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setJobs(data);
          } else {
            setJobs(MOCK_JOBS); // Fallback to mock data if DB is empty
          }
        } else {
          setJobs(MOCK_JOBS);
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
        setJobs(MOCK_JOBS);
      }
    };
    fetchJobs();
  }, []);

  const swiped = async (direction, job) => {
    console.log('removing: ' + job.title)
    setLastDirection(direction)
    
    // Call backend to record swipe action
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
    console.log(name + ' left the screen!')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Discover Opportunities</h1>
        <p className="text-gray-500 mt-2">Swipe right to apply, left to pass</p>
      </div>

      <div className="relative w-full max-w-sm h-[550px]">
        {jobs.map((job, index) => (
          <TinderCard
            className="absolute top-0 left-0 right-0 w-full"
            key={job.id}
            onSwipe={(dir) => swiped(dir, job)}
            onCardLeftScreen={() => outOfFrame(job.title)}
            preventSwipe={['up', 'down']}
          >
            <JobCard job={job} />
          </TinderCard>
        ))}
        {jobs.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl">
            <p className="text-gray-500 font-medium">No more jobs available!</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 mt-10">
        <button className="w-16 h-16 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:scale-110 transition-transform hover:bg-red-50">
          <X size={32} strokeWidth={3} />
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center text-yellow-500 hover:scale-110 transition-transform hover:bg-yellow-50">
          <Undo2 size={24} strokeWidth={2.5} />
        </button>
        <button className="w-16 h-16 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-green-500 hover:scale-110 transition-transform hover:bg-green-50">
          <Heart size={32} strokeWidth={3} />
        </button>
      </div>
      
      {lastDirection ? (
        <h2 className="infoText mt-6 text-gray-500 animate-pulse">
          You swiped {lastDirection}
        </h2>
      ) : (
        <h2 className="infoText mt-6 text-gray-500 opacity-0">Placeholder</h2>
      )}
    </div>
  );
}
