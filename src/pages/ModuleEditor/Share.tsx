import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Globe2, Copy, Check, Lock, Users, Clock, ListPlus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PlaylistSelectionModal } from '../../components/content/PlaylistSelectionModal';

interface VisibilityOptionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

function VisibilityOption({ icon, label, description, isSelected, onClick }: VisibilityOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 text-left transition-all ${
        isSelected
          ? 'border-[#008080] bg-[#008080]/5'
          : 'border-gray-200 hover:border-[#008080]/30'
      }`}
    >
      <div className={`${isSelected ? 'text-[#008080]' : 'text-gray-600'}`}>
        {icon}
      </div>
      <h3 className={`font-medium mt-2 ${isSelected ? 'text-[#008080]' : 'text-gray-900'}`}>
        {label}
      </h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </button>
  );
}

export default function Share() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('id');
  const [isPublished, setIsPublished] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private' | 'restricted'>('private');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareUrl = `https://ronunest.com/modules/${moduleId}`;
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    if (moduleId) {
      loadModuleStatus();
    }
  }, [moduleId]);

  const loadModuleStatus = async () => {
    try {
      const { data: module, error } = await supabase
        .from('modules')
        .select('visibility')
        .eq('id', moduleId)
        .single();

      if (error) throw error;

      if (module) {
        setVisibility(module.visibility);
        setIsPublished(module.visibility !== 'draft');
      }
    } catch (err) {
      console.error('Error loading module status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load module status');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!moduleId) return;

    setIsSaving(true);
    setError(null);

    try {
      const newVisibility = isPublished ? 'draft' : visibility;
      
      const { error } = await supabase
        .from('modules')
        .update({ 
          visibility: newVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) throw error;

      setIsPublished(!isPublished);
    } catch (err) {
      console.error('Error updating module status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update module status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVisibilityChange = async (newVisibility: typeof visibility) => {
    if (!moduleId || !isPublished) return;

    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('modules')
        .update({ 
          visibility: newVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', moduleId);

      if (error) throw error;

      setVisibility(newVisibility);
    } catch (err) {
      console.error('Error updating visibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to update visibility');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#008080]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Module Status */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Module Status</h2>
        <p className="text-gray-600 mb-6">
          Control who can access your module
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Published</h3>
            <p className="text-sm text-gray-600">
              {isPublished 
                ? 'This module is live and can be viewed by others based on access settings'
                : 'This module is currently in draft mode and only visible to you'}
            </p>
          </div>
          <div className="flex items-center">
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#008080]" />
            ) : (
              <button
                onClick={handlePublishToggle}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublished ? 'bg-[#ff4d00]' : 'bg-gray-200'
                }`}
                role="switch"
                aria-checked={isPublished}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isPublished ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {isPublished && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Access Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VisibilityOption
                icon={<Globe2 className="w-5 h-5" />}
                label="Public"
                description="Anyone can access"
                isSelected={visibility === 'public'}
                onClick={() => handleVisibilityChange('public')}
              />
              <VisibilityOption
                icon={<Lock className="w-5 h-5" />}
                label="Private"
                description="Only you and invited users"
                isSelected={visibility === 'private'}
                onClick={() => handleVisibilityChange('private')}
              />
              <VisibilityOption
                icon={<Users className="w-5 h-5" />}
                label="Restricted"
                description="Specific groups only"
                isSelected={visibility === 'restricted'}
                onClick={() => handleVisibilityChange('restricted')}
              />
            </div>
          </div>
        )}
      </section>

      {/* Add to Playlists */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#333333] mb-2">Add to Playlists</h2>
            <p className="text-gray-600">
              Include this module in your playlists for better organization
            </p>
          </div>
          <button
            onClick={() => setShowPlaylistModal(true)}
            className="flex items-center px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors"
          >
            <ListPlus className="w-4 h-4 mr-2" />
            Add to Playlists
          </button>
        </div>
      </section>

      {showPlaylistModal && (
        <PlaylistSelectionModal
          moduleId={moduleId!}
          onClose={() => setShowPlaylistModal(false)}
        />
      )}

      {/* Share Link */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
        <h2 className="text-xl font-semibold text-[#333333] mb-2">Share Link</h2>
        <p className="text-gray-600 mb-6">
          Share this module directly using a link
        </p>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <Globe2 className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-gray-600 truncate">{shareUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}