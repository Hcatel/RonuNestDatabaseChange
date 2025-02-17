import React from 'react';
import { Link, Routes, Route, useLocation, useSearchParams, Outlet } from 'react-router-dom';
import { FileText, Settings, ArrowLeft, UserPlus } from 'lucide-react';

export default function GroupLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('id');
  const currentPath = location.pathname;
  const isActive = React.useCallback((path: string) => {
    return currentPath.endsWith(path);
  }, [currentPath]);

  const getGroupUrl = (path: string) => {
    return groupId ? `${path}?id=${groupId}` : path;
  };

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Group Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-full">
          {/* Back to Content Link */}
          <Link
            to="/studio/learners"
            className="flex items-center gap-3 text-gray-600 hover:text-[#008080] transition-colors group p-4 border-b border-gray-200"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-gray-900">Back to Learners</span>
          </Link>

          <div className="px-4 py-6">
            <h2 className="text-lg font-semibold text-[#333333]">Group Creator</h2>
            <p className="text-sm text-gray-600">Edit your group</p>
            
            {/* Navigation */}
            <nav className="space-y-1 mt-6">
              <NavLink 
                to={getGroupUrl('/studio/learners/group')}
                icon={<FileText className="w-7 h-7" />} 
                label="Details" 
                isActive={isActive('group')}
              />
              <NavLink 
                to={getGroupUrl('/studio/learners/group/members')}
                icon={<UserPlus className="w-7 h-7" />} 
                label="Members" 
                isActive={isActive('members')}
              />
              <NavLink 
                to={getGroupUrl('/studio/learners/group/settings')}
                icon={<Settings className="w-7 h-7" />} 
                label="Settings" 
                isActive={isActive('settings')}
              />
            </nav>
          </div>
        </aside>

        {/* Group Content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <main className="pt-24 px-8 pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavLink({ to, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-[#008080]/15 text-[#008080]'
          : 'text-gray-500 hover:bg-gray-100 hover:text-[#008080]'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}