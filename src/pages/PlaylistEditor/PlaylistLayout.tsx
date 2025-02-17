import React, { useState } from 'react';
import { Link, Routes, Route, useLocation, useSearchParams, Outlet } from 'react-router-dom';
import { FileText, ListMusic, BarChart3, ArrowLeft } from 'lucide-react';
import PlaylistContent from './PlaylistContent';

export default function PlaylistLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get('id');
  const currentPath = location.pathname;
  const isActive = React.useCallback((path: string) => {
    return currentPath.endsWith(path);
  }, [currentPath]);

  const getPlaylistUrl = (path: string) => {
    return playlistId ? `${path}?id=${playlistId}` : path;
  };

  console.log("PlaylistLayout is rendering", {
    location,
    playlistId,
    currentPath
  });

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Playlist Navigation */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-full pt-16">
          {console.log("Rendering sidebar")}
          {/* Back to Content Link */}
          {console.log("About to render back link")}
          <Link
            to="/studio/content"
            className="flex items-center gap-3 text-gray-600 hover:text-[#008080] transition-colors group px-4 py-3"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-gray-900">Back to Content</span>
          </Link>

          <div className="px-4 py-3">
            <h2 className="text-lg font-semibold text-[#333333]">Playlist Creator</h2>
            <p className="text-sm text-gray-600">Edit your playlist</p>
            
            {/* Navigation */}
            <nav className="space-y-1 mt-4">
              <NavLink 
                to={getPlaylistUrl('/studio/content/playlist')}
                icon={<FileText className="w-7 h-7" />} 
                label="Details" 
                isActive={isActive('playlist')}
              />
              <NavLink 
                to={getPlaylistUrl('/studio/content/playlist/content')}
                icon={<ListMusic className="w-7 h-7" />} 
                label="Content" 
                isActive={isActive('content')}
              />
              <NavLink 
                to={getPlaylistUrl('/studio/content/playlist/analytics')}
                icon={<BarChart3 className="w-7 h-7" />} 
                label="Analytics" 
                isActive={isActive('analytics')}
              />
            </nav>
          </div>
        </aside>

        {/* Playlist Content */}
        <div className="flex-1 overflow-auto bg-gray-50 pt-16">
          <main className="p-8">
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