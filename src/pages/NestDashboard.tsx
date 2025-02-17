import React from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  UserCog,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import Content from './Content';
import Learners from './Learners';
import Media from './ModuleEditor/Media';
import PlaylistContent from './PlaylistEditor/PlaylistContent';
import Share from './ModuleEditor/Share';
import ModuleLayout from './ModuleEditor/ModuleLayout';
import PlaylistLayout from './PlaylistEditor/PlaylistLayout';
import PlaylistDetails from './PlaylistEditor/PlaylistDetails';
import GroupDetails from './GroupEditor/GroupDetails';
import GroupMembers from './GroupEditor/GroupMembers';
import GroupLayout from './GroupEditor/GroupLayout';
import Build from './ModuleEditor/Build';
import ModuleSummary from './ModuleEditor/ModuleSummary';

export default function NestDashboard() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const isEditor = location.pathname.startsWith('/studio/content/module') || 
                   location.pathname.startsWith('/studio/content/playlist');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {!isEditor && <div className="w-64 bg-white border-r border-gray-200 flex flex-col mt-16">
        {/* Logo */}
        <div className="p-4">
          <Link to="/studio" className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#ff4d00] to-[#008080] rounded-full flex items-center justify-center p-0.5 mb-2">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#ff4d00] to-[#008080]">R</span>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">Your Nest</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <NavItem
              to="/studio"
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              isActive={isActive('/studio')}
            />
            <NavItem
              to="/studio/content"
              icon={<FileText className="w-5 h-5" />}
              label="Content"
              isActive={isActive('/studio/content')}
            />
            <NavItem
              to="/studio/learners"
              icon={<Users className="w-5 h-5" />}
              label="Learners"
              isActive={isActive('/studio/learners')}
            />
            <NavItem
              to="/studio/analytics"
              icon={<BarChart3 className="w-5 h-5" />}
              label="Analytics"
              isActive={isActive('/studio/analytics')}
            />
            <NavItem
              to="/studio/settings"
              icon={<Settings className="w-5 h-5" />}
              label="Nest Settings"
              isActive={isActive('/studio/settings')}
            />
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-1">
            <NavItem
              to="/settings"
              icon={<UserCog className="w-5 h-5" />}
              label="User Settings"
              isActive={isActive('/settings')}
            />
            <NavItem
              to="/feedback"
              icon={<MessageSquare className="w-5 h-5" />}
              label="Feedback"
              isActive={isActive('/feedback')}
            />
            <NavItem
              to="/help"
              icon={<HelpCircle className="w-5 h-5" />}
              label="Help"
              isActive={isActive('/help')}
            />
          </div>
        </div>
      </div>}

      {/* Main Content */}
      <Routes>
        <Route path="content" element={<Content />} />
        <Route path="content/playlist" element={<PlaylistLayout />}>
          <Route index element={<PlaylistDetails />} />
          <Route path="content" element={<PlaylistContent />} />
          <Route path="analytics" element={<div>Analytics</div>} />
        </Route>
        <Route path="content/module" element={<ModuleLayout />}>
          <Route index element={<ModuleSummary />} />
          <Route path="build" element={<Build />} />
          <Route path="media" element={<Media />} />
          <Route path="share" element={<Share />} />
          <Route path="analytics" element={<div>Analytics</div>} />
        </Route>
        <Route path="learners/group" element={<GroupLayout />}>
          <Route index element={<GroupDetails />} />
          <Route path="members" element={<GroupMembers />} />
          <Route path="content" element={<div>Available Content</div>} />
          <Route path="settings" element={<div>Settings</div>} />
        </Route>
        <Route path="learners" element={<Learners />} />
        <Route path="/" element={
          <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 mt-16">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#333333]">Nest Dashboard</h1>
            <div className="flex items-center space-x-4">
              <input
                type="search"
                placeholder="Search across your nest"
                className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
              />
              <button className="px-4 py-2 border border-[#008080] text-[#008080] rounded-lg hover:bg-teal-50 transition-colors">
                Preview site
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Latest Module Performance */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <h2 className="text-lg font-semibold text-[#333333] mb-4">Latest Module Performance</h2>
              <div className="aspect-video bg-gray-100 rounded-lg mb-4">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                  alt="Latest module"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <h3 className="font-medium text-gray-900 mb-4">Think Outside the Box</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completion rate</span>
                  <span className="text-[#333333] hover:text-[#008080] transition-colors">78%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Number of starts</span>
                  <span className="text-[#333333] hover:text-[#008080] transition-colors">245</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average completion time</span>
                  <span className="text-[#333333] hover:text-[#008080] transition-colors">45 mins</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button className="w-full px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors">
                  Go to module analytics
                </button>
                <button className="w-full px-4 py-2 border border-[#008080] text-[#008080] rounded-lg hover:bg-teal-50 transition-colors">
                  See comments
                </button>
              </div>
            </div>

            {/* Nest Analytics */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <h2 className="text-lg font-semibold text-[#333333] mb-4">Nest Analytics</h2>
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Number of Learners</p>
                <p className="text-4xl font-bold text-[#ff4d00]">640</p>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                  <p className="text-xs text-gray-500 mb-1">Last 30 days</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Views/Accessed</span>
                      <span className="text-[#333333]">1,245</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Module time</span>
                      <span className="text-[#333333]">3,890 mins</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estimated Revenue</span>
                      <span className="text-[#333333]">$4,520</span>
                    </div>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors">
                  Go to nest analytics
                </button>
              </div>
            </div>

            {/* Ronunest Updates */}
            <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow-lg border border-gray-100 hover:shadow-xl transition-all">
              <h2 className="text-lg font-semibold text-[#333333] mb-4">Ronunest Updates</h2>
              <div className="h-[200px] flex items-center justify-center bg-gray-100/50 rounded-lg mb-4 border border-gray-100">
                <p className="text-gray-500">No new updates</p>
              </div>
              <button className="w-full px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors">
                Find out more
              </button>
            </div>
          </div>
        </main>
          </div>
        } />
      </Routes>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-[#008080]/70 text-[#333333]'
          : 'text-[#333333] hover:bg-teal-50 hover:text-[#008080]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}