export interface Point {
  x: number;
  y: number;
}

export interface NodeConfig {
  title: string;
  content?: string;
  connection?: string; // Single connection for non-router nodes
  required?: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoControls?: {
    autoplay: boolean;
    showPlayPause: boolean;
    showVolume: boolean;
    showSubtitles: boolean;
    allowSeeking: boolean;
  };
  question?: string;
  choices?: Array<{
    id: string;
    text: string;
    connection?: string; // Connection for each choice in router nodes
  }>;
  overlay?: boolean; // Whether the router appears as an overlay
  allowMultiple?: boolean;
  rankingItems?: string[];
}

export interface Node {
  id: string;
  type: 'message' | 'video' | 'router' | 'textInput' | 'multipleChoice' | 'ranking';
  position: Point;
  title: string;
  connection?: string; // Single connection for non-router nodes
  color: string;
  config: NodeConfig;
}