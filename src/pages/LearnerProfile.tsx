import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Book, Users, Star } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

export default function LearnerProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, email: user.email }])
            .select()
            .single();

          if (!createError && newProfile) {
            setProfile(newProfile);
          }
        } else if (!error && data) {
          setProfile(data);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view your profile
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-[#fefefe] rounded-lg shadow-md p-6 mb-6 border border-[#ff4d00]/10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-[#ff4d00] rounded-full flex items-center justify-center text-[#fefefe] text-3xl font-bold shadow-lg">
              {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#333333]">
                {profile?.full_name || 'Profile'}
              </h1>
              <p className="text-gray-600 hover:text-[#008080] transition-colors">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-8 h-8 text-[#ff4d00]" />}
            title="Achievements"
            value="12"
            description="Completed"
          />
          <StatCard
            icon={<Book className="w-8 h-8 text-[#ff4d00]" />}
            title="Courses"
            value="5"
            description="In Progress"
          />
          <StatCard
            icon={<Users className="w-8 h-8 text-[#ff4d00]" />}
            title="Groups"
            value="3"
            description="Active"
          />
          <StatCard
            icon={<Star className="w-8 h-8 text-[#ff4d00]" />}
            title="Creators"
            value="8"
            description="Following"
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-[#fefefe] rounded-lg shadow-md p-6 border border-[#ff4d00]/10">
          <h2 className="text-xl font-bold text-[#333333] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <ActivityItem
              title="Completed Module"
              description="Introduction to Web Development"
              date="2 days ago"
            />
            <ActivityItem
              title="Joined Group"
              description="Frontend Developers Community"
              date="1 week ago"
            />
            <ActivityItem
              title="Started Course"
              description="Advanced JavaScript Patterns"
              date="2 weeks ago"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, description }) {
  return (
    <div className="bg-[#fefefe] rounded-lg shadow-md p-6 border border-[#ff4d00]/10 hover:border-[#008080]/20 transition-colors">
      <div className="flex items-center gap-4 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-[#333333] hover:text-[#008080] transition-colors">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-[#333333] hover:text-[#008080] transition-colors mb-1">{value}</p>
      <p className="text-gray-600 hover:text-[#008080] transition-colors">{description}</p>
    </div>
  );
}

function ActivityItem({ title, description, date }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-2 h-2 bg-[#ff4d00] rounded-full"></div>
      <div className="flex-1">
        <h4 className="font-medium text-[#333333] hover:text-[#008080] transition-colors">{title}</h4>
        <p className="text-gray-600 hover:text-[#008080] transition-colors">{description}</p>
      </div>
      <p className="text-sm text-gray-500 hover:text-[#008080] transition-colors">{date}</p>
    </div>
  );
}