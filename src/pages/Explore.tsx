import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Filter, ChevronDown, Star, BookOpen, Clock, MoreVertical } from 'lucide-react';
import { ModuleOptionsMenu } from '../components/content/ModuleOptionsMenu';

interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  creator_id: string;
  views: number;
  created_at: string;
}

export default function Explore() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, popular, newest
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchModules();
  }, [filter]);

  const fetchModules = async () => {
    try {
      let query = supabase
        .from('modules')
        .select('*')
        .eq('visibility', 'public');

      if (filter === 'popular') {
        query = query.order('views', { ascending: false });
      } else if (filter === 'newest') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#ff4d00] to-[#008080] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Explore Learning Modules</h1>
          <p className="text-xl text-white/90 mb-8">
            Discover interactive learning experiences created by experts worldwide
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 bg-white/90 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-[#008080] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('popular')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'popular'
                  ? 'bg-[#008080] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setFilter('newest')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'newest'
                  ? 'bg-[#008080] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Newest
            </button>
          </div>
          
          <button className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Modules Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No modules found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleCard({ module }: { module: Module }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/modules/${module.id}`)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <img
        src={module.thumbnail_url || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
        alt={module.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-[#008080] transition-colors">
          {module.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{module.description}</p>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                4.8
              </span>
              <span className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                {module.views}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <ModuleOptionsMenu moduleId={module.id} />
          </div>
        </div>
      </div>
    </div>
  );
}