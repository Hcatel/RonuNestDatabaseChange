import { FileText, Video, GitBranch, Type, ListChecks, MoveVertical } from 'lucide-react';
import type { Node } from './types';

export const getNodeColor = (type: Node['type']): string => {
  switch (type) {
    case 'message': return '#3b82f6'; // blue
    case 'video': return '#10b981'; // green
    case 'router': return '#8b5cf6'; // purple
    case 'textInput': return '#f59e0b'; // yellow
    case 'multipleChoice': return '#ef4444'; // red
    case 'ranking': return '#ec4899'; // pink
    default: return '#6b7280'; // gray
  }
};

export const getNodeIcon = (type: Node['type']) => {
  switch (type) {
    case 'message': return FileText;
    case 'video': return Video;
    case 'router': return GitBranch;
    case 'textInput': return Type;
    case 'multipleChoice': return ListChecks;
    case 'ranking': return MoveVertical;
    default: return FileText;
  }
};

export const getDefaultConfig = (type: Node['type']): Node['config'] => {
  switch (type) {
    case 'message':
      return {
        title: 'New Message',
        content: '',
        required: false
      };
    case 'video':
      return {
        title: 'Video Content',
        videoUrl: '',
        thumbnailUrl: '',
        required: false,
        videoControls: {
          autoplay: false,
          showPlayPause: true,
          showVolume: true,
          showSubtitles: true,
          allowSeeking: true
        }
      };
    case 'router':
      return {
        title: 'Decision Point',
        question: '',
        choices: [],
        overlay: false,
        required: true // Router nodes are always required
      };
    case 'textInput':
      return {
        title: 'Text Question',
        question: '',
        required: false
      };
    case 'multipleChoice':
      return {
        title: 'Multiple Choice',
        question: '',
        choices: [],
        allowMultiple: true,
        required: false
      };
    case 'ranking':
      return {
        title: 'Ranking Question',
        question: '', // Added question field
        rankingItems: [],
        required: false
      };
    default:
      return { title: 'New Node' };
  }
};