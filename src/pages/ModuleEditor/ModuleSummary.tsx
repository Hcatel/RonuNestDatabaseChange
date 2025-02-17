import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, Lock, Globe2, Users, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

type ModuleVisibility = 'draft' | 'private' | 'public' | 'restricted';

export default function ModuleSummary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<ModuleVisibility>('private');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setError] = useState<string | null>(null);
  const [showSaveReminder, setShowSaveReminder] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(false);

  useEffect(() => {
    const loadModule = async (id: string) => {
      setIsLoading(true);
      try {
        const { data: module, error } = await supabase
          .from('modules')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (module) {
          setTitle(module.title || '');
          setDescription(module.description || '');
          setVisibility(module.visibility);
          if (module.thumbnail_url) {
            setThumbnailPreview(module.thumbnail_url);
          }
        }
      } catch (err) {
        console.error('Error loading module:', err);
        setError(err instanceof Error ? err.message : 'Failed to load module');
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId) {
      loadModule(moduleId);
    } else {
      // Reset form when no module ID is present
      setTitle('');
      setDescription('');
      setVisibility('private');
      setThumbnailPreview('');
      setThumbnail(null);
      setIsLoading(false);
    }
  }, [moduleId]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let thumbnailUrl = thumbnailPreview;
      if (thumbnail) {
        const fileExt = thumbnail.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('module-thumbnails')
          .upload(fileName, thumbnail);

        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from('module-thumbnails')
          .getPublicUrl(fileName);
        thumbnailUrl = publicUrl;
      }

      const moduleData = {
        title,
        description,
        visibility,
        thumbnail_url: thumbnailUrl,
        creator_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (moduleId) {
        // Update existing module
        const { error } = await supabase
          .from('modules')
          .update(moduleData)
          .eq('id', moduleId);

        if (error) throw error;
      } else {
        // Create new module
        const { data, error } = await supabase
          .from('modules')
          .insert(moduleData)
          .select()
          .single();

        if (error) throw error;
        
        // Navigate to build page with the new module ID
        if (data) {
          navigate(`/studio/content/module/build?id=${data.id}`);
          return;
        }
      }

      setError('Module saved successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      console.error('Error saving module:', err);
      setError(err instanceof Error ? err.message : 'Failed to save module');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuildClick = () => {
    if (!title.trim()) {
      setError('Title is required');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!moduleId) {
      setShowSaveReminder(true);
      setPendingNavigation(true);
    } else {
      navigate(`/studio/content/module/build?id=${moduleId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation Links */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          {moduleId && (
            <button
              onClick={handleBuildClick}
              className="px-4 py-2 border border-[#008080] text-[#008080] rounded-lg hover:bg-teal-50 transition-colors"
            >
              Go to Build
            </button>
          )}
        </div>
      </div>

      {saveError && (
        <div className={`p-4 rounded-lg mb-8 ${
          saveError.includes('success')
            ? 'bg-green-50 text-green-600'
            : 'bg-red-50 text-red-600'
        }`}>
          {saveError}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#008080]" />
        </div>
      ) : (
        <>
          {/* Module Details */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#333333] mb-6">Module Details</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <div className="relative">
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter module title"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent ${
                    !title.trim() ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {!title.trim() && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">
                    Required
                  </span>
                )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter module description"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d00] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thumbnail
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  {thumbnailPreview ? (
                    <div className="space-y-1 text-center">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="thumbnail"
                          className="relative cursor-pointer rounded-md font-medium text-[#008080] hover:text-[#006666] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#008080]"
                        >
                          <span>Change thumbnail</span>
                          <input id="thumbnail" type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="thumbnail"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-[#008080] hover:text-[#006666] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#008080]"
                        >
                          <span>Upload a thumbnail</span>
                          <input id="thumbnail" type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#333333] mb-6">Status</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>Draft</span>
            </div>
          </section>

          {/* Analytics Overview */}
          <section className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#333333] mb-6">Analytics Overview</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart3 className="w-5 h-5" />
              <span>Coming soon</span>
            </div>
          </section>

          {/* Access Settings */}
          <section className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-[#333333] mb-6">Access Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <VisibilityOption
                icon={<Clock className="w-5 h-5" />}
                label="Draft"
                description="Only you can see this"
                isSelected={visibility === 'draft'}
                onClick={() => setVisibility('draft')}
              />
              <VisibilityOption
                icon={<Lock className="w-5 h-5" />}
                label="Private"
                description="Only you and invited users"
                isSelected={visibility === 'private'}
                onClick={() => setVisibility('private')}
              />
              <VisibilityOption
                icon={<Globe2 className="w-5 h-5" />}
                label="Public"
                description="Anyone can access"
                isSelected={visibility === 'public'}
                onClick={() => setVisibility('public')}
              />
              <VisibilityOption
                icon={<Users className="w-5 h-5" />}
                label="Restricted"
                description="Specific groups only"
                isSelected={visibility === 'restricted'}
                onClick={() => setVisibility('restricted')}
              />
            </div>
          </section>
        </>
      )}
      
      {/* Save Reminder Modal */}
      {showSaveReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Changes?</h3>
            <p className="text-gray-600 mb-4">
              You need to save your module before proceeding to the build page. Would you like to save now?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowSaveReminder(false);
                  setPendingNavigation(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleSave();
                  setShowSaveReminder(false);
                  if (pendingNavigation) {
                    navigate(`/studio/content/module/build?id=${moduleId}`);
                  }
                }}
                className="px-4 py-2 bg-[#ff4d00] text-white rounded-lg hover:bg-[#e64600] transition-colors"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}