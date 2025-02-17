import React, { useState } from 'react';
import { Video as VideoIcon, Image, ToggleLeft } from 'lucide-react';
import type { Node } from '../../types';
import { MediaSelectorModal } from './MediaSelectorModal';

interface VideoConfigProps {
  config: Node['config'];
  onChange: (config: Partial<Node['config']>) => void;
}

export function VideoConfig({ config, onChange }: VideoConfigProps) {
  const [showVideoSelector, setShowVideoSelector] = useState(false);
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video Source
        </label>
        <div className="space-y-4">
          {/* Video Preview */}
          {config.videoUrl && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                src={config.videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Video Selection */}
          <div className="flex gap-2">
            <input
              type="url"
              value={config.videoUrl || ''}
              onChange={(e) => onChange({ videoUrl: e.target.value })}
              placeholder="Enter video URL or choose from media"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowVideoSelector(true)}
              className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
            >
              Choose Video
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thumbnail
        </label>
        <div className="space-y-4">
          {/* Thumbnail Preview */}
          {config.thumbnailUrl && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={config.thumbnailUrl}
                alt="Video thumbnail"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Thumbnail Selection */}
          <div className="flex gap-2">
            <input
              type="url"
              value={config.thumbnailUrl || ''}
              onChange={(e) => onChange({ thumbnailUrl: e.target.value })}
              placeholder="Enter thumbnail URL or choose from media"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008080] focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowThumbnailSelector(true)}
              className="px-4 py-2 bg-[#008080] text-white rounded-lg hover:bg-[#006666] transition-colors"
            >
              Choose Thumbnail
            </button>
          </div>
        </div>
      </div>

      {/* Required Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">
          Response Required
        </span>
        <button
          onClick={() => onChange({ required: !config.required })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            config.required ? 'bg-[#ff4d00]' : 'bg-gray-200'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              config.required ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Video Controls */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Video Controls
        </label>
        <div className="space-y-2 divide-y divide-gray-100" onClick={(e) => e.stopPropagation()}>
          {Object.entries(config.videoControls || {}).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <button
                type="button"
                onClick={() => onChange({
                  videoControls: {
                    ...config.videoControls,
                    [key]: !value
                  }
                })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  value ? 'bg-[#ff4d00]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    value ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Media Selector Modals */}
      {showVideoSelector && (
        <MediaSelectorModal
          title="Select Video"
          acceptedTypes={['video/*']}
          onSelect={(url) => {
            onChange({ videoUrl: url });
            setShowVideoSelector(false);
          }}
          onClose={() => setShowVideoSelector(false)}
        />
      )}

      {showThumbnailSelector && (
        <MediaSelectorModal
          title="Select Thumbnail"
          acceptedTypes={['image/*']}
          onSelect={(url) => {
            onChange({ thumbnailUrl: url });
            setShowThumbnailSelector(false);
          }}
          onClose={() => setShowThumbnailSelector(false)}
        />
      )}
    </>
  );
}