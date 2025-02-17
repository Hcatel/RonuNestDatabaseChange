import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Share2, ArrowRight, Facebook, Twitter, Linkedin } from 'lucide-react';

interface CompletionPageProps {
  moduleTitle: string;
  showShareMenu: boolean;
  setShowShareMenu: (show: boolean) => void;
  handleShare: (platform: string) => void;
  handleCopyLink: () => void;
  copySuccess: boolean;
}

export function CompletionPage({
  moduleTitle,
  showShareMenu,
  setShowShareMenu,
  handleShare,
  handleCopyLink,
  copySuccess
}: CompletionPageProps) {
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d00]/20 to-[#008080]/20 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#ff4d00] to-[#008080] p-1">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <Trophy className="w-16 h-16 text-transparent bg-clip-text bg-gradient-to-br from-[#ff4d00] to-[#008080]" />
            </div>
          </div>
          <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#ff4d00]/10 rounded-full animate-pulse" />
          <div className="absolute -left-6 -bottom-6 w-16 h-16 bg-[#008080]/10 rounded-full animate-pulse delay-150" />
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d00] to-[#008080] mb-6">
        Congratulations! You've completed this Module
      </h1>
      
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
        You've successfully completed "{moduleTitle}". Keep up the great work!
      </p>

      <div className="flex flex-wrap justify-center gap-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff4d00]/5 to-[#008080]/5 blur-xl -z-10" />
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center px-8 py-4 bg-gradient-to-r from-[#ff4d00] to-[#008080] text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          View Summary
        </button>
        
        <button
          onClick={() => navigate('/explore')}
          className="flex items-center px-8 py-4 border-2 border-[#008080] text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d00] to-[#008080] rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Explore More
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:border-[#008080] hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Share
            <Share2 className="w-5 h-5 ml-2" />
          </button>
          
          {showShareMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 transform origin-top-right transition-all duration-200">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#ff4d00]/5 hover:to-[#008080]/5 transition-colors"
              >
                <Facebook className="w-4 h-4 mr-3" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#ff4d00]/5 hover:to-[#008080]/5 transition-colors"
              >
                <Twitter className="w-4 h-4 mr-3" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#ff4d00]/5 hover:to-[#008080]/5 transition-colors"
              >
                <Linkedin className="w-4 h-4 mr-3" />
                LinkedIn
              </button>
              <hr className="my-2" />
              <button
                onClick={handleCopyLink}
                className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#ff4d00]/5 hover:to-[#008080]/5 transition-colors"
              >
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}