import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, ChevronDown, MoreVertical, Users, Loader2, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  thumbnail_url: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  member_id: string;
  created_at: string;
}

export default function Learners() {
  console.log('=== Learners Page Render ===');
  const [activeTab, setActiveTab] = useState<'groups' | 'individual'>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [learners, setLearners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== Tab Change Effect ===', { activeTab });
    if (activeTab === 'groups') {
      loadGroups();
    } else {
      loadLearners();
    }
  }, [activeTab]);

  const loadGroups = async () => {
    console.log('=== Loading Groups ===');
    console.log('Fetching groups from Supabase...');

    try {
      // Get current user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      console.log('Current user:', user.id);

      const { data, error } = await supabase
        .from('groups')
        .select(`
          *
        `)
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Groups fetched:', data?.length || 0, 'groups found');
      
      // Get member counts for each group
      console.log('Fetching member counts for each group...');
      const groupsWithCounts = await Promise.all((data || []).map(async (group) => {
        console.log('Fetching member count for group:', group.id);
        const { count, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);
          
        if (countError) throw countError;
        console.log('Group', group.id, 'has', count, 'members');
        return { ...group, memberCount: count || 0 };
      }));
      
      setGroups(groupsWithCounts);
      console.log('=== Groups Loading Complete ===', {
        totalGroups: groupsWithCounts.length,
        groupsWithMembers: groupsWithCounts.filter(g => g.memberCount > 0).length
      });
    } catch (err) {
      console.error('Error loading groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const loadLearners = async () => {
    console.log('=== Loading Learners ===');
    try {
      console.log('Getting current user...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      console.log('Current user:', user.id);

      // Get all profiles and count their group memberships
      console.log('Fetching learner profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *
        `)
        .neq('id', user.id) // Exclude current user
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Profiles fetched:', data?.length || 0, 'learners found');
      
      // Get group counts for each learner
      console.log('Fetching group counts for each learner...');
      const learnersWithCounts = await Promise.all((data || []).map(async (learner) => {
        console.log('Fetching group count for learner:', learner.id);
        const { count, error: countError } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('member_id', learner.id);
          
        if (countError) throw countError;
        console.log('Learner', learner.id, 'belongs to', count, 'groups');
        return { ...learner, groupCount: count || 0 };
      }));
      
      setLearners(learnersWithCounts);
      console.log('=== Learners Loading Complete ===', {
        totalLearners: learnersWithCounts.length,
        learnersInGroups: learnersWithCounts.filter(l => l.groupCount > 0).length
      });
    } catch (err) {
      console.error('Error loading learners:', err);
      setError(err instanceof Error ? err.message : 'Failed to load learners');
    } finally {
      setLoading(false);
    }
  };

  return (
    console.log('=== Rendering Learners Page ===', {
      activeTab,
      groupsCount: groups.length,
      learnersCount: learners.length,
      loading,
      error
    }),
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
              {activeTab === 'groups' ? `${groups.length} Groups` : `${learners.length} Learners`}
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#008080] mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No groups found. Click "Create Group" to get started.
                  </td>
                </tr>
              ) : groups.map((group) => (
                <tr key={group.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#008080]/10 rounded-lg flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-[#008080]" />
                      </div>
                      <span 
                        onClick={() => navigate(`/studio/learners/group?id=${group.id}`)}
                        className="font-medium text-gray-900 hover:text-[#008080] cursor-pointer"
                      >
                        {group.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{group.memberCount || 0} members</td>
                  <td className="px-4 py-3 text-gray-600">--</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(group.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(group.updated_at).toLocaleDateString()}
                  </td>
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#008080] mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : learners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No learners found.
                  </td>
                </tr>
              ) : learners.map((learner) => (
                <tr key={learner.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <td className="p-4">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 hover:text-[#008080] cursor-pointer">
                      {learner.username}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {learner.full_name ? learner.full_name.split(' ')[0] : '--'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {learner.full_name ? learner.full_name.split(' ').slice(1).join(' ') : '--'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-[#008080]" />
                      <span className="text-gray-600">{learner.groupCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(learner.created_at).toLocaleDateString()}
                  </td>
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