import React, { useState } from 'react';
import { Link, Routes, Route, useLocation, useSearchParams, Outlet } from 'react-router-dom';
import { FileText, Code, Image, Share2, BarChart3, ChevronLeft } from 'lucide-react';
import Media from './Media';

export default function ModuleLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('id');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const currentPath = location.pathname;
  const isActive = React.useCallback((path: string) => {
    return currentPath.endsWith(path);
  }, [currentPath]);
  const isBuildPage = location.pathname.endsWith('/build');

  const handleNavClick = (path: string) => {
    // Navigation handled by React Router
  };

  const getModuleUrl = (path: string) => {
    return moduleId ? `${path}?id=${moduleId}` : path;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className={`flex h-[calc(100vh-${isBuildPage ? '0' : '4rem'})]`}>
        {/* Module Navigation */}
        <div
          className={`bg-white border-r border-gray-200 transition-all duration-300 pt-16 z-[49] relative ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
          onMouseEnter={() => setIsSidebarCollapsed(false)}
          onMouseLeave={() => setIsSidebarCollapsed(true)}
        >
          <div className="relative h-full">
            {/* Back to Content Link */}
            <Link 
              to="/studio/content" 
              className={`flex items-center px-4 py-3 text-gray-600 hover:text-[#008080] transition-colors ${
                isSidebarCollapsed ? 'justify-center' : 'gap-3'
              }`}
            >
              <ChevronLeft className="w-7 h-7" />
              {!isSidebarCollapsed && <span className="font-medium">Back to Content</span>}
            </Link>

            <div className={`px-4 py-3 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
              <h2 className="text-lg font-semibold text-[#333333]">Module Creator</h2>
              <p className="text-sm text-gray-600">Edit your module</p>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1 px-4 mt-4">
              <NavLink 
                to={getModuleUrl('/studio/content/module')}
                icon={<FileText className="w-7 h-7" />} 
                label="Summary" 
                isActive={isActive('module')} 
                isCollapsed={isSidebarCollapsed}
              />
              <NavLink 
                to={getModuleUrl('/studio/content/module/build')}
                icon={<Code className="w-7 h-7" />} 
                label="Build" 
                isActive={isActive('build')} 
                isCollapsed={isSidebarCollapsed}
              />
              <NavLink 
                to={getModuleUrl('/studio/content/module/media')}
                icon={<Image className="w-7 h-7" />} 
                label="My Media" 
                isActive={isActive('media')} 
                isCollapsed={isSidebarCollapsed}
              />
              <NavLink 
                to={getModuleUrl('/studio/content/module/share')}
                icon={<Share2 className="w-7 h-7" />} 
                label="Share & Access"
                isActive={isActive('share')} 
                isCollapsed={isSidebarCollapsed}
              />
              <NavLink 
                to={getModuleUrl('/studio/content/module/analytics')}
                icon={<BarChart3 className="w-7 h-7" />} 
                label="Analytics" 
                isActive={isActive('analytics')} 
                isCollapsed={isSidebarCollapsed}
              />
            </nav>
          </div>
        </div>

        {/* Module Content */}
        <div className={`flex-1 overflow-auto bg-gray-50 ${isBuildPage ? 'p-0' : 'pt-16'}`}>
          <main className={isBuildPage ? '' : isActive('module') ? 'p-8' : 'p-8'}>
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
  onClick?: () => void;
  isCollapsed: boolean;
}

function NavLink({ to, icon, label, isActive, isCollapsed, onClick }: NavLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center ${isCollapsed ? 'justify-center h-10' : 'gap-3'} px-3 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-[#008080]/15 text-[#008080]'
          : 'text-gray-500 hover:bg-gray-100 hover:text-[#008080]'
      }`}
    >
      <div className="flex items-center justify-center">{icon}</div>
      {!isCollapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
}