import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserCircle, Brain, Sparkles, Users, Globe2, ArrowRight, Blocks, Puzzle, Settings, LogOut, GraduationCap as Graduation, PenTool } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import NestDashboard from './pages/NestDashboard';
import LearnerProfile from './pages/LearnerProfile';
import Explore from './pages/Explore';
import ModuleViewer from './pages/ModuleViewer/index';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('profile-dropdown');
      const profileButton = document.getElementById('profile-button');
      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        !profileButton?.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-[#fefefe]">
      {/* Navigation Banner */}
      <nav className="bg-white border-b border-gray-100 fixed w-full top-0 z-[51]">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-[#ff4d00] transition-colors">
              <span className="bg-gradient-to-r from-[#ff4d00] to-[#008080] bg-clip-text text-transparent">RonuNest</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <Link 
                to="/explore" 
                onClick={() => {
                  console.log('=== Explore Button Click ===');
                  console.log('Current pathname:', location.pathname);
                  console.log('Navigating to: /explore');
                }} 
                className="text-[#333333] hover:text-[#008080] transition-colors"
              >
                Explore
              </Link>
              <Link 
                to="/studio/content/module" 
                onClick={() => {
                  console.log('=== Create Button Click ===');
                  console.log('Current pathname:', location.pathname);
                  console.log('Navigating to: /studio/content/module');
                }} 
                className="text-[#333333] hover:text-[#008080] transition-colors"
              >
                Create
              </Link>
              {user ? ( 
                <div className="relative">
                  <button
                    id="profile-button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="text-[#ff4d00] hover:text-[#e64600] transition-colors"
                  >
                    <UserCircle className="w-8 h-8" />
                  </button>
                  
                  {isProfileOpen && (
                    <div
                      id="profile-dropdown"
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-[52] border border-gray-100"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-600">Signed in as</p>
                        <p className="font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-[#333333] hover:bg-[#008080]/50 hover:text-[#333333] transition-colors"
                      >
                        <Graduation className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/studio"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-[#333333] hover:bg-[#008080]/50 hover:text-[#333333] transition-colors"
                      >
                        <PenTool className="w-4 h-4 mr-3" />
                        Nest Studio
                      </Link>
                      
                      <Link
                        to="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-[#333333] hover:bg-[#008080]/50 hover:text-[#333333] transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-[#333333] hover:bg-[#ff4d00]/50 hover:text-[#333333] transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <Routes>
        <Route path="/profile" element={<LearnerProfile />} />
        <Route path="/studio/*" element={<NestDashboard />} />
        <Route path="/modules/:moduleId" element={<ModuleViewer />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <header className="container mx-auto px-4 pt-32 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The <span className="text-[#ff4d00]">Story-Driven</span> Learning
            <br />
            Adventure Platform
          </h1>
          <p className="text-xl text-[#333333] mb-8">
            Transform your expertise into interactive, story-driven learning adventures. 
            Empower learners with personalized, engaging content that adapts to their choices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/studio/content/module"
              onClick={() => {
                console.log('=== Create Button Click ===');
                console.log('Current pathname:', location.pathname);
                console.log('Navigating to: /studio/content/module');
              }}
              className="px-8 py-4 bg-[#ff4d00] text-white rounded-lg font-semibold hover:bg-[#e64600] transition-colors flex items-center justify-center"
            >
              Start Creating <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 bg-white text-[#008080] border-2 border-[#008080] rounded-lg font-semibold hover:bg-teal-50 transition-colors flex items-center justify-center"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-[#333333] mb-12">
          Everything You Need to Create Amazing Learning Experiences
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Blocks />}
            title="Drag & Drop Builder"
            description="Create interactive courses with our intuitive drag-and-drop interface. No coding required."
          />
          <FeatureCard 
            icon={<Brain />}
            title="AI-Powered Assistance"
            description="Get intelligent suggestions for content creation and learning paths."
          />
          <FeatureCard 
            icon={<Puzzle />}
            title="Interactive Storytelling"
            description="Build branching scenarios and decision-based learning experiences."
          />
          <FeatureCard 
            icon={<Users />}
            title="Social Learning"
            description="Enable collaborative learning with built-in social features and discussions."
          />
          <FeatureCard 
            icon={<Sparkles />}
            title="Personalization"
            description="Adapt content dynamically based on learner choices and progress."
          />
        </div>
      </section>

      {/* Global Impact Section */}
      <section className="bg-[#ff4d00] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">
                Making Education Accessible Globally
              </h2>
              <p className="text-lg text-orange-100 mb-8">
                RonuNest is committed to transforming education worldwide, with a special focus on emerging markets. Our platform is designed to work seamlessly across devices and internet conditions.
              </p>
              <div className="flex items-center gap-4">
                <Globe2 className="h-12 w-12 text-orange-200" />
                <div>
                  <p className="text-2xl font-bold">190+ Countries</p>
                  <p className="text-orange-200">Global Reach</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                alt="Students learning together" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-[#fefefe] p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-[#ff4d00] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-[#333333] mb-2 hover:text-[#008080] transition-colors">{title}</h3>
      <p className="text-[#333333]">{description}</p>
    </div>
  );
}

export default App;