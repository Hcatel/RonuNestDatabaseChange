import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ChevronDown, MoreVertical, Users } from 'lucide-react';

interface Learner {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  groupCount: number;
  dateAdded: string;
  lastModified: string;
}

interface Group {
  id: number;
  name: string;
  size: number;
  playlistCount: number;
  createdAt: string;
  lastModified: string;
}

const mockLearners: Learner[] = [
  {
    id: 1,
    email: 'sarah.parker@example.com',
    firstName: 'Sarah',
    lastName: 'Parker',
    groupCount: 2,
    dateAdded: '01-Feb-2025',
    lastModified: '10-Feb-2025 15:30'
  },
  {
    id: 2,
    email: 'michael.chen@example.com',
    firstName: 'Michael',
    lastName: 'Chen',
    groupCount: 3,
    dateAdded: '03-Feb-2025',
    lastModified: '09-Feb-2025 11:45'
  },
  {
    id: 3,
    email: 'emma.wilson@example.com',
    firstName: 'Emma',
    lastName: 'Wilson',
    groupCount: 1,
    dateAdded: '05-Feb-2025',
    lastModified: '08-Feb-2025 09:20'
  }
];

const mockGroups: Group[] = [
  {
    id: 1,
    name: 'Web Development Cohort',
    size: 25,
    playlistCount: 8,
    createdAt: '01-Feb-2025',
    lastModified: '10-Feb-2025 15:30'
  },
  {
    id: 2,
    name: 'UI/UX Design Team',
    size: 15,
    playlistCount: 5,
    createdAt: '05-Feb-2025',
    lastModified: '09-Feb-2025 11:45'
  },
  {
    id: 3,
    name: 'Mobile App Workshop',
    size: 30,
    playlistCount: 12,
    createdAt: '03-Feb-2025',
    lastModified: '08-Feb-2025 09:20'
  }
];

export default function Learners() {
  const [activeTab, setActiveTab] = useState<'groups' | 'individual'>('groups');
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-auto">
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#333333]">Learners</h1>
          <input
            type="search"
            placeholder="Search learners and groups"
            className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex mt-8 bg-gray-100/50 p-1 rounded-lg space-x-1 w-fit">
          {['groups', 'individual'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-[#008080] shadow-sm'
                  : 'text-gray-600 hover:text-[#008080] hover:bg-white/50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <main className="p-8">
        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-[#008080] transition-colors border border-gray-200 rounded-lg">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <div className="text-sm text-gray-600">
              {activeTab === 'groups' ? '3 Groups' : '3 Learners'}
            </div>
          </div>
          <button 
            onClick={() => {
              if (activeTab === 'groups') {
                navigate('/studio/learners/group');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'groups' ? 'Create Group' : 'Add Learner'}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-8 p-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                {activeTab === 'groups' ? (
                <>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Group Name
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Group Size
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Playlists
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Created
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Last Modified
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                </>
                ) : (
                <>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Email
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    First Name
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Last Name
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Groups
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button className="flex items-center hover:text-[#008080]">
                    Date Added
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                </th>
                </>
                )}
                <th className="w-8 px-4 py-3"></th>
              </tr>
            </thead>
            {activeTab === 'groups' ? (
            <tbody>
              {mockGroups.map((group) => (
                <tr key={group.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#008080]/10 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-[#008080]" />
                      </div>
                      <span className="font-medium text-gray-900 hover:text-[#008080] cursor-pointer">
                        {group.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{group.size} members</td>
                  <td className="px-4 py-3 text-gray-600">{group.playlistCount}</td>
                  <td className="px-4 py-3 text-gray-600">{group.createdAt}</td>
                  <td className="px-4 py-3 text-gray-600">{group.lastModified}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            ) : (
            <tbody>
              {mockLearners.map((learner) => (
                <tr key={learner.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 hover:text-[#008080] cursor-pointer">
                      {learner.email}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{learner.firstName}</td>
                  <td className="px-4 py-3 text-gray-600">{learner.lastName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#008080]" />
                      <span className="text-gray-600">{learner.groupCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{learner.dateAdded}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            )}
          </table>
        </div>
      </main>
    </div>
  );
}