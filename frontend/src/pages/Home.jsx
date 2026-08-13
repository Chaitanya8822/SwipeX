import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-white">
        Discover Jobs Intelligently
      </h1>
      <p className="text-xl text-gray-300 max-w-2xl mb-10">
        Swipe through relevant opportunities, optimize your resume with AI, and land your dream job faster.
      </p>
      <div className="flex gap-4">
        <Link to="/feed" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-transform hover:scale-105">
          Start Swiping
        </Link>
        <button className="bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/5 text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition-colors">
          Upload Resume
        </button>
      </div>
    </div>
  );
}
