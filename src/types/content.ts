export interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  visibility: 'draft' | 'private' | 'public' | 'restricted';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  visibility: 'public' | 'private' | 'restricted';
  created_at: string;
  updated_at: string;
  creator_id: string;
}

export interface StorageFile {
  id: number;
  name: string;
  metadata: {
    size: number;
    mimetype: string;
  };
  created_at: string;
}

export interface Filters {
  title?: string;
  visibility?: string;
  views?: {
    min?: number;
    max?: number;
  };
  date?: {
    start?: string;
    end?: string;
  };
}