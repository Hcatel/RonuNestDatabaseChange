import React from 'react';
import { ChevronDown, Trash2, MoreVertical } from 'lucide-react';
import { ModuleOptionsMenu } from './ModuleOptionsMenu';
import { PlaylistOptionsMenu } from './PlaylistOptionsMenu';
import type { Module, Playlist, StorageFile } from '../../types/content';

interface ContentTableProps {
  activeTab: 'modules' | 'playlists' | 'media';
  modules: Module[];
  playlists: Playlist[];
  mediaFiles: StorageFile[];
  onSort: (field: string) => void;
  onDelete: (fileName: string) => void;
  formatFileSize: (bytes: number) => string;
}

export function ContentTable({ 
  activeTab, 
  modules, 
  playlists, 
  mediaFiles, 
  onSort,
  onDelete,
  formatFileSize 
}: ContentTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="w-8 p-4">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              <button className="flex items-center hover:text-[#008080]">
                Title
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              {activeTab === 'media' ? (
                <button
                  onClick={() => onSort('type')}
                  className="flex items-center hover:text-[#008080]"
                >
                  Type
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              ) : (
                'Accessibility'
              )}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              {activeTab === 'media' ? (
                <button
                  onClick={() => onSort('size')}
                  className="flex items-center hover:text-[#008080]"
                >
                  Size
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>
              ) : (
                'Views'
              )}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              <button className="flex items-center hover:text-[#008080]">
                Completion Rate
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              <button className="flex items-center hover:text-[#008080]">
                Duration
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
              <button className="flex items-center hover:text-[#008080]">
                Modified
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            </th>
            <th className="w-8 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {activeTab === 'modules' && modules.map((module) => (
            <ModuleRow key={module.id} module={module} />
          ))}
          {activeTab === 'playlists' && playlists.map((playlist) => (
            <PlaylistRow key={playlist.id} playlist={playlist} />
          ))}
          {activeTab === 'media' && mediaFiles.map((file) => (
            <MediaRow 
              key={file.id} 
              file={file} 
              formatFileSize={formatFileSize}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModuleRow({ module }: { module: Module }) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <img
            src={module.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
            alt={module.title}
            className="w-12 h-8 object-cover rounded mr-3"
          />
          <a
            href={`/studio/content/module?id=${module.id}`}
            className="font-medium text-gray-900 hover:text-[#008080]"
          >
            {module.title}
          </a>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            module.visibility === 'public'
              ? 'bg-green-100 text-green-800'
              : module.visibility === 'private'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {module.visibility.charAt(0).toUpperCase() + module.visibility.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">{module.views}</td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">Coming soon</span>
      </td>
      <td className="px-4 py-3 text-gray-600">--:--</td>
      <td className="px-4 py-3 text-gray-600">
        {new Date(module.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>
      <td className="px-4 py-3">
        <ModuleOptionsMenu moduleId={module.id} />
      </td>
    </tr>
  );
}

function PlaylistRow({ playlist }: { playlist: Playlist }) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center">
          <img
            src={playlist.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
            alt={playlist.title}
            className="w-12 h-8 object-cover rounded mr-3"
          />
          <a
            href={`/studio/content/playlist?id=${playlist.id}`}
            className="font-medium text-gray-900 hover:text-[#008080]"
          >
            {playlist.title}
          </a>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            playlist.visibility === 'public'
              ? 'bg-green-100 text-green-800'
              : playlist.visibility === 'private'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {playlist.visibility.charAt(0).toUpperCase() + playlist.visibility.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">--</td>
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">Coming soon</span>
      </td>
      <td className="px-4 py-3 text-gray-600">--:--</td>
      <td className="px-4 py-3 text-gray-600">
        {new Date(playlist.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </td>
      <td className="px-4 py-3">
        <PlaylistOptionsMenu playlistId={playlist.id} />
      </td>
    </tr>
  );
}

function MediaRow({ 
  file, 
  formatFileSize,
  onDelete 
}: { 
  file: StorageFile;
  formatFileSize: (bytes: number) => string;
  onDelete: (fileName: string) => void;
}) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="p-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 hover:text-[#008080] cursor-pointer">
          {file.name}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600">{file.metadata.mimetype}</td>
      <td className="px-4 py-3 text-gray-600">{formatFileSize(file.metadata.size)}</td>
      <td className="px-4 py-3"></td>
      <td className="px-4 py-3"></td>
      <td className="px-4 py-3 text-gray-600">
        {new Date(file.created_at).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(file.name)}
          className="p-1 hover:bg-red-50 rounded-lg group"
        >
          <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
        </button>
      </td>
    </tr>
  );
}